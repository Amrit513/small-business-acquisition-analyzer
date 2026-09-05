import { openDB, type DBSchema } from "idb";
import type { BusinessInputs, FinancingInputs } from "@/types/business";
import { normalizeEvidence, type EvidenceMap } from "@/lib/evidence/provenance";

import { parseListingDraft, type ListingDraft } from "@/lib/import/listing";

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
  const parsed: unknown = JSON.parse(raw);
  if (!isExportEnvelope(parsed)) throw new Error("This is not a valid Acquisition Lens export.");
  return { ...parsed.deal, evidence: normalizeEvidence(parsed.deal.evidence), listingSource: parsed.deal.listingSource ? parseListingDraft(JSON.stringify(parsed.deal.listingSource)) : undefined, needsListingReview: Boolean(parsed.deal.needsListingReview) };
}

function isExportEnvelope(value: unknown): value is { schemaVersion: 1 | 2; deal: SavedDeal } {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Record<string, unknown>;
  if ((envelope.schemaVersion !== 1 && envelope.schemaVersion !== 2) || !envelope.deal || typeof envelope.deal !== "object") return false;
  const deal = envelope.deal as Record<string, unknown>;
  return typeof deal.id === "string" && typeof deal.name === "string" && typeof deal.updatedAt === "string" && typeof deal.business === "object" && deal.business !== null && typeof deal.financing === "object" && deal.financing !== null;
}
