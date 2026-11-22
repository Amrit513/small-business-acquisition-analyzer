import { openDB, type DBSchema } from "idb";
import type { BusinessInputs, FinancingInputs } from "@/types/business";
import { normalizeEvidence, type EvidenceMap } from "@/lib/evidence/provenance";
import { plausiblePastInstant } from "@/lib/import/time";

import { parseListingDraft, type ListingDraft } from "@/lib/import/listing";
import { parseJsonDocument } from "@/lib/import/json";
import { readUtf8File, type BinaryFile } from "@/lib/import/utf8";

export interface SavedDeal {
  id: string;
  name: string;
  business: BusinessInputs;
  financing: FinancingInputs;
  evidence?: EvidenceMap;
  listingSource?: ListingDraft;
  needsListingReview?: boolean;
  updatedAt: string;
}

interface AcquisitionLensDB extends DBSchema {
  deals: {
    key: string;
    value: SavedDeal;
    indexes: { "by-updated": string };
  };
}

const DB_NAME = "acquisition-lens";
const DB_VERSION = 1;

function getDatabase() {
  return openDB<AcquisitionLensDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const store = database.createObjectStore("deals", { keyPath: "id" });
      store.createIndex("by-updated", "updatedAt");
    },
  });
}

export async function saveDeal(deal: SavedDeal): Promise<void> {
  const database = await getDatabase();
  await database.put("deals", deal);
}

export async function listDeals(): Promise<SavedDeal[]> {
  const database = await getDatabase();
  const deals = await database.getAllFromIndex("deals", "by-updated");
  return deals.reverse();
}

export async function deleteDeal(id: string): Promise<void> {
  const database = await getDatabase();
  await database.delete("deals", id);
}

export function serializeDeal(deal: SavedDeal): string {
  return JSON.stringify({ schemaVersion: 2, deal: { ...deal, evidence: normalizeEvidence(deal.evidence) } }, null, 2);
}

export function parseDealExport(raw: string): SavedDeal {
  if (raw.length > MAX_DEAL_IMPORT_BYTES || new TextEncoder().encode(raw).length > MAX_DEAL_IMPORT_BYTES) {
    throw new Error("Deal exports must be 256 KiB or smaller.");
  }
  const parsed = parseJsonDocument(raw);
  if (!isExportEnvelope(parsed)) throw new Error("This is not a valid Acquisition Lens export.");
  return { ...parsed.deal, evidence: normalizeEvidence(parsed.deal.evidence), listingSource: parsed.deal.listingSource !== undefined ? parseListingDraft(JSON.stringify(parsed.deal.listingSource)) : undefined, needsListingReview: parsed.deal.needsListingReview ?? false };
}

export const MAX_DEAL_IMPORT_BYTES = 256 * 1024;

/** Check size before reading the file, then validate before any local database write. */
export async function readDealExport(file: BinaryFile): Promise<SavedDeal> {
  return parseDealExport(await readUtf8File(file, MAX_DEAL_IMPORT_BYTES, "Deal exports must be 256 KiB or smaller."));
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function boundedNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function onlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  const keys = new Set(allowed);
  return Object.keys(value).every(key => keys.has(key));
}

// Technical import limits, not investment assumptions. Cap amortization work and
// numeric magnitude; never coerce strings or replace missing figures with zeros.
function validBusiness(value: unknown): boolean {
  if (!record(value)) return false;
  return onlyKeys(value, ["purchasePrice", "annualRevenue", "sde", "ebitda", "growthRate", "industry", "numberOfEmployees", "currentExpenses", "ownerSalary"])
    && ["purchasePrice", "annualRevenue", "currentExpenses", "ownerSalary"].every(key => boundedNumber(value[key], 0, 1e12))
    && ["sde", "ebitda"].every(key => boundedNumber(value[key], -1e12, 1e12))
    && boundedNumber(value.growthRate, -1, 10)
    && boundedNumber(value.numberOfEmployees, 0, 1e7) && Number.isInteger(value.numberOfEmployees)
    && typeof value.industry === "string"
    && ["retail", "restaurant", "service", "ecommerce", "manufacturing", "software", "healthcare", "construction", "professional-services", "other"].includes(value.industry);
}

function validFinancing(value: unknown): boolean {
  if (!record(value)) return false;
  if (!onlyKeys(value, ["downPayment", "loanAmount", "interestRate", "loanTermYears", "closingCosts", "sellerFinancing"])
    || !["downPayment", "loanAmount"].every(key => boundedNumber(value[key], 0, 1e12))
    || !boundedNumber(value.interestRate, 0, 1) || !boundedNumber(value.loanTermYears, 0, 100)
    || (value.closingCosts !== undefined && !boundedNumber(value.closingCosts, 0, 1e12))) return false;
  if (value.sellerFinancing === undefined) return true;
  const seller = value.sellerFinancing;
  return record(seller) && onlyKeys(seller, ["amount", "interestRate", "termYears"])
    && boundedNumber(seller.amount, 0, 1e12)
    && boundedNumber(seller.interestRate, 0, 1) && boundedNumber(seller.termYears, 0, 100);
}

function validEvidence(value: unknown): boolean {
  if (value === undefined) return true;
  if (!record(value)) return false;
  const fields = ["purchasePrice", "annualRevenue", "sde", "ebitda", "currentExpenses", "ownerSalary"] as const;
  const levels = new Set(["unverified", "listing", "seller-provided", "document-supported"]);
  return onlyKeys(value, fields) && Object.values(value).every(level => typeof level === "string" && levels.has(level));
}

function isExportEnvelope(value: unknown): value is { schemaVersion: 1 | 2; deal: SavedDeal } {
  if (!record(value)) return false;
  const envelope = value as Record<string, unknown>;
  if (!onlyKeys(envelope, ["schemaVersion", "deal"]) || (envelope.schemaVersion !== 1 && envelope.schemaVersion !== 2) || !envelope.deal || typeof envelope.deal !== "object") return false;
  const deal = envelope.deal as Record<string, unknown>;
  return record(deal) && onlyKeys(deal, ["id", "name", "business", "financing", "evidence", "listingSource", "needsListingReview", "updatedAt"])
    && typeof deal.id === "string" && deal.id.trim().length > 0 && deal.id.length <= 256
    && typeof deal.name === "string" && deal.name.length <= 1000
    && plausiblePastInstant(deal.updatedAt)
    && (deal.needsListingReview === undefined || typeof deal.needsListingReview === "boolean")
    && validEvidence(deal.evidence) && validBusiness(deal.business) && validFinancing(deal.financing);
}
