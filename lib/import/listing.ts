import { parseJsonDocument } from "./json";
import { plausiblePastInstant } from "./time";

export const listingFields = ["purchasePrice", "annualRevenue", "sde", "ebitda"] as const;
export const MAX_LISTING_IMPORT_BYTES = 12000;
export const MAX_LISTING_TITLE_LENGTH = 160;
export const LISTING_REVIEW_WARNING = "Review every amount. Imported listing claims have not been independently verified.";
export type ListingField = typeof listingFields[number];
export const listingLabels: Record<ListingField, string> = {
  purchasePrice: "Asking price", annualRevenue: "Annual revenue", sde: "SDE", ebitda: "EBITDA",
};
export interface ListingDraft {
  kind: "acquisition-lens-listing";
  version: 1;
  title: string;
  url: string;
  capturedAt: string;
  values: Partial<Record<ListingField, number>>;
  quotes: Partial<Record<ListingField, string>>;
  warnings: string[];
}
function listingTitle(value:string):string {return value.trim()||"Imported listing";}
const labels: Record<ListingField, string> = {
  purchasePrice: "(?:asking\\s+price|purchase\\s+price|business\\s+price)",
  annualRevenue: "(?:(?:annual|gross|ttm)\\s+(?:revenue|sales)|revenue|gross\\s+income)",
  sde: "(?:seller['’]?s?\\s+discretionary\\s+earnings|sde|cash\\s+flow\\s*\\(\\s*sde\\s*\\))",
  ebitda: "(?:adjusted\\s+ebitda|ebitda)",
};
const monthlyClaims: Partial<Record<ListingField, RegExp>> = {
  annualRevenue: /(?:\bmonthly\s+(?:revenue|sales|gross\s+income)\b|\b(?:revenue|sales|gross\s+income)\b[^\n]{0,80}(?:\/\s*(?:mo(?:nth)?|month)|per\s+month|monthly))/i,
  sde: /(?:\bmonthly\s+sde\b|\bsde\b[^\n]{0,80}(?:\/\s*(?:mo(?:nth)?|month)|per\s+month|monthly))/i,
  ebitda: /(?:\bmonthly\s+(?:adjusted\s+)?ebitda\b|\bebitda\b[^\n]{0,80}(?:\/\s*(?:mo(?:nth)?|month)|per\s+month|monthly))/i,
};

/** One USD amount; a leading minus or accounting parentheses can mean an earnings loss. */
export function parseListingAmount(raw: string, field?: ListingField): number | undefined {
  let text = raw.trim();
  const signed = field === "sde" || field === "ebitda";
  const negative = text.startsWith("-") || /^\(.+\)$/.test(text);
  if (negative && !signed) return undefined;
  if (negative) text = text[0] === "(" ? text.slice(1, -1).trim() : text.slice(1).trim();
  const match = text.match(/^(?:USD\s*|US\s*\$\s*|\$\s*)?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(k|m|million|thousand|billion|b)?(?:\s*USD)?$/i);
  if (!match?.[1]) return undefined;
  const suffix = match[2]?.toLowerCase();
  const factor = suffix === "k" || suffix === "thousand" ? 1e3 : suffix === "m" || suffix === "million" ? 1e6 : suffix === "b" || suffix === "billion" ? 1e9 : 1;
  const value = Number(match[1].replace(/,/g, "")) * factor;
  return Number.isFinite(value) && value >= 0 && value <= 1e12 ? (negative ? -1 : 1) * Math.round(value * 100) / 100 : undefined;
}

export function reviewListingAmounts(draft: ListingDraft, rawAmounts: Partial<Record<ListingField, string>>):
  | { ok: true; draft: ListingDraft }
  | { ok: false; field: ListingField; message: string } {
  const values: ListingDraft["values"] = {};
  const quotes = { ...draft.quotes };
  for (const field of listingFields) {
    const raw = rawAmounts[field]?.trim() ?? "";
    const amount = raw ? parseListingAmount(raw, field) : undefined;
    if (raw && amount === undefined) return { ok: false, field, message: `Review ${listingLabels[field].toLowerCase()}: use one USD amount or leave it blank.` };
    if (amount !== undefined) values[field] = amount;
    if (amount !== draft.values[field]) delete quotes[field];
  }
  return { ok: true, draft: { ...draft, title:listingTitle(draft.title), values, quotes } };
}

export function safeListingUrl(raw: string): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "";
    // Do not carry tracking parameters, session tokens or fragments into a deal.
    return (url.origin + url.pathname).slice(0, 800);
  } catch { return ""; }
}

/** Preserve an actual capture instant; never replace missing provenance with import time. */
function captureTimestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return "";
  // Allow small device-clock drift, but never present a clearly future claim as capture provenance.
  return plausiblePastInstant(value) ? new Date(value).toISOString() : "";
}

/** Convert a normalized capture instant to the importing device's calendar date. */
export function listingCaptureDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2, "0"), day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function extractListing(text: string, title = "", url = ""): ListingDraft {
  const draft: ListingDraft = { kind: "acquisition-lens-listing", version: 1, title: listingTitle(title).slice(0, 160), url: safeListingUrl(url), capturedAt: new Date().toISOString(), values: {}, quotes: {}, warnings: [] };
  const lines = text.slice(0, 60000).replace(/\u00a0/g, " ").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (text.length > 60000) draft.warnings.push("Only the first 60,000 characters were inspected.");
  for (const field of listingFields) {
    const candidates: Array<{ value: number; quote: string }> = [];
    let uncertain = false;
    const pattern = new RegExp(`^${labels[field]}(?:\\s*\\((?:TTM|annual|USD)\\))?\\s*(?::|\\t|[-–—]\\s+)?\\s*(.*)$`, "i");
    lines.forEach((line, index) => {
      const match = line.match(pattern);
      if (!match) return;
      const amountText = match[1]?.trim() || lines[index + 1] || "";
      const value = parseListingAmount(amountText, field);
      if (value === undefined) uncertain = true;
      else candidates.push({ value, quote: `${line}${match[1]?.trim() ? "" : ` ${amountText}`}`.slice(0, 180) });
    });
    const unique = [...new Set(candidates.map(candidate => candidate.value))];
    if (unique.length === 1 && !uncertain && candidates[0]) {
      draft.values[field] = unique[0];
      draft.quotes[field] = candidates[0].quote;
    } else if (unique.length > 1 || uncertain) {
      draft.warnings.push(`${listingLabels[field]} is ambiguous or not an exact annual USD amount. Enter it manually.`);
    }
    if (monthlyClaims[field]?.test(text)) draft.warnings.push(`${listingLabels[field]} includes a monthly claim. It was not annualized; confirm and enter an annual USD amount manually.`);
  }
  if (draft.quotes.annualRevenue && !/\b(?:annual|annually|ttm|yearly|fiscal\s+year|fy\s*\d{2,4})\b/i.test(draft.quotes.annualRevenue)) {
    draft.warnings.push("The revenue label did not state an annual or TTM period. Confirm its reporting period before use.");
  }
  if (/\bcash\s+flow\b/i.test(text) && draft.values.sde === undefined) draft.warnings.push("Cash flow was not assumed to mean SDE. Confirm the seller's earnings definition.");
  draft.warnings.push("Listing claims are unverified. Confirm USD currency and annual reporting periods before use.");
  return draft;
}

/** Whitelist external input; never accept evidence levels, HTML or extra financial fields. */
export function parseListingDraft(raw: string): ListingDraft {
  if (raw.length > MAX_LISTING_IMPORT_BYTES || new TextEncoder().encode(raw).length > MAX_LISTING_IMPORT_BYTES) throw new Error("This listing is too large to import.");
  const data = parseJsonDocument(raw);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid listing file.");
  const value = data as Record<string, unknown>;
  const topKeys = new Set(["kind", "version", "title", "url", "capturedAt", "values", "quotes", "warnings"]);
  if (Object.keys(value).some(key => !topKeys.has(key))) throw new Error("This listing contains unsupported fields.");
  if (value.kind !== "acquisition-lens-listing" || value.version !== 1 || !value.values || typeof value.values !== "object" || Array.isArray(value.values)) throw new Error("This is not an Acquisition Lens listing file.");
  const rawValues = value.values as Record<string, unknown>;
  if (Object.keys(rawValues).some(key => !listingFields.includes(key as ListingField))) throw new Error("This listing contains unsupported financial fields.");
  if (value.quotes !== undefined && (!value.quotes || typeof value.quotes !== "object" || Array.isArray(value.quotes))) throw new Error("Invalid listing excerpts.");
  const rawQuotes = (value.quotes ?? {}) as Record<string, unknown>;
  if (Object.keys(rawQuotes).some(key => !listingFields.includes(key as ListingField))) throw new Error("This listing contains unsupported excerpt fields.");
  if (value.title !== undefined && (typeof value.title !== "string" || value.title.length > MAX_LISTING_TITLE_LENGTH)) throw new Error("Invalid listing title.");
  if (value.url !== undefined && (typeof value.url !== "string" || value.url.length > 800)) throw new Error("Invalid listing source URL.");
  if (value.capturedAt !== undefined && typeof value.capturedAt !== "string") throw new Error("Invalid listing capture time.");
  if (value.warnings !== undefined && (!Array.isArray(value.warnings) || value.warnings.length > 20 || value.warnings.some(warning => typeof warning !== "string" || warning.length > 220))) throw new Error("Invalid listing warnings.");
  const warnings = [...new Set([...(value.warnings as string[] | undefined ?? []), LISTING_REVIEW_WARNING])];
  if (warnings.length > 20) throw new Error("This listing has too many warnings.");
  const values: ListingDraft["values"] = {};
  const quotes: ListingDraft["quotes"] = {};
  for (const field of listingFields) {
    const amount = rawValues[field];
    if (amount !== undefined) {
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < ((field === "sde" || field === "ebitda") ? -1e12 : 0) || amount > 1e12) throw new Error(`Invalid ${listingLabels[field].toLowerCase()} in listing.`);
      values[field] = amount;
    }
    const quote = rawQuotes[field];
    if (quote !== undefined && (typeof quote !== "string" || quote.length > 180)) throw new Error(`Invalid ${listingLabels[field].toLowerCase()} excerpt in listing.`);
    if (quote !== undefined && amount === undefined) throw new Error(`${listingLabels[field]} excerpt requires a matching amount.`);
    if (amount !== undefined && typeof quote === "string") quotes[field] = quote.slice(0, 180);
  }
  return {
    kind: "acquisition-lens-listing", version: 1,
    title: typeof value.title === "string" ? listingTitle(value.title) : "Imported listing",
    url: typeof value.url === "string" ? safeListingUrl(value.url) : "",
    capturedAt: captureTimestamp(value.capturedAt),
    values, quotes,
    warnings,
  };
}

export function listingFragment(draft: ListingDraft): string {
  return `#listing=${encodeURIComponent(JSON.stringify(parseListingDraft(JSON.stringify(draft))))}`;
}

export function listingFromFragment(fragment: string): ListingDraft | undefined {
  if (!fragment.startsWith("#listing=")) return undefined;
  if (fragment.length > 36000) throw new Error("This listing link is too large.");
  return parseListingDraft(decodeURIComponent(fragment.slice(9)));
}
