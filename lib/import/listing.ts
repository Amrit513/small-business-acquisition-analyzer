import type { BusinessInputs, FinancingInputs } from "@/types/business";
import type { EvidenceMap } from "@/lib/evidence/provenance";

export const listingFields = ["purchasePrice", "annualRevenue", "sde", "ebitda"] as const;
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
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : "";
}

export function extractListing(text: string, title = "", url = ""): ListingDraft {
  const draft: ListingDraft = { kind: "acquisition-lens-listing", version: 1, title: title.trim().slice(0, 160) || "Imported listing", url: safeListingUrl(url), capturedAt: new Date().toISOString(), values: {}, quotes: {}, warnings: [] };
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
  if (raw.length > 12000 || new TextEncoder().encode(raw).length > 12000) throw new Error("This listing is too large to import.");
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object") throw new Error("Invalid listing file.");
  const value = data as Record<string, unknown>;
  if (value.kind !== "acquisition-lens-listing" || value.version !== 1 || !value.values || typeof value.values !== "object" || Array.isArray(value.values)) throw new Error("This is not an Acquisition Lens listing file.");
  const values: ListingDraft["values"] = {};
  const quotes: ListingDraft["quotes"] = {};
  for (const field of listingFields) {
    const amount = (value.values as Record<string, unknown>)[field];
    if (amount !== undefined) {
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < ((field === "sde" || field === "ebitda") ? -1e12 : 0) || amount > 1e12) throw new Error(`Invalid ${listingLabels[field].toLowerCase()} in listing.`);
      values[field] = amount;
    }
    const quote = value.quotes && typeof value.quotes === "object" ? (value.quotes as Record<string, unknown>)[field] : undefined;
    if (amount !== undefined && typeof quote === "string") quotes[field] = quote.slice(0, 180);
  }
  return {
    kind: "acquisition-lens-listing", version: 1,
    title: typeof value.title === "string" ? value.title.slice(0, 160) : "Imported listing",
    url: typeof value.url === "string" ? safeListingUrl(value.url) : "",
    capturedAt: captureTimestamp(value.capturedAt),
    values, quotes,
    warnings: [...new Set([...(Array.isArray(value.warnings) ? value.warnings.filter((w): w is string => typeof w === "string" && w.length <= 220).slice(0, 8) : []), "Review every amount. Imported listing claims have not been independently verified."])],
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

/** Starting from zero prevents sample-deal financials leaking into an imported company. */
export function listingToInputs(draft: ListingDraft): { business: BusinessInputs; financing: FinancingInputs; evidence: EvidenceMap } {
  const business: BusinessInputs = { purchasePrice: 0, annualRevenue: 0, sde: 0, ebitda: 0, growthRate: 0, industry: "other", numberOfEmployees: 0, currentExpenses: 0, ownerSalary: 0, ...draft.values };
  const financing: FinancingInputs = { downPayment: 0, loanAmount: 0, interestRate: 0, loanTermYears: 10, closingCosts: 0 };
  const evidence: EvidenceMap = { purchasePrice: "unverified", annualRevenue: "unverified", sde: "unverified", ebitda: "unverified", currentExpenses: "unverified", ownerSalary: "unverified" };
  for (const field of listingFields) if (draft.values[field] !== undefined) evidence[field] = "listing";
  return { business, financing, evidence };
}
