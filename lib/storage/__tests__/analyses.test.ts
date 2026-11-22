import { describe, expect, it, vi } from "vitest";
import { MAX_DEAL_IMPORT_BYTES, parseDealExport, readDealExport, serializeDeal, type SavedDeal } from "@/lib/storage/analyses";
import { extractListing } from "@/lib/import/listing";

const deal: SavedDeal = { id: "deal-1", name: "Atlas", updatedAt: "2026-08-17T00:00:00.000Z", business: { purchasePrice: 425000, annualRevenue: 520000, sde: 170000, ebitda: 125000, growthRate: .07, industry: "service", numberOfEmployees: 6, currentExpenses: 350000, ownerSalary: 80000 }, financing: { downPayment: 85000, loanAmount: 340000, interestRate: .095, loanTermYears: 10 } };

describe("deal export evidence migration", () => {
  it("accepts a valid legacy deal file saved with a UTF-8 byte-order mark", () => {
    expect(parseDealExport("\ufeff" + serializeDeal(deal))).toEqual(parseDealExport(serializeDeal(deal)));
  });

  it("exports version two with normalized evidence", () => {
    const parsed = JSON.parse(serializeDeal(deal)) as { schemaVersion: number; deal: SavedDeal };
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.deal.evidence?.purchasePrice).toBe("unverified");
  });

  it("imports legacy version-one deals with conservative defaults", () => {
    const imported = parseDealExport(JSON.stringify({ schemaVersion: 1, deal }));
    expect(imported.evidence?.sde).toBe("unverified");
    expect(imported.evidence?.purchasePrice).toBe("unverified");
  });
});

describe("untrusted saved-deal imports", () => {
  it.each([
    { business: [] }, { business: {} }, { financing: [] },
    { business: { ...deal.business, sde: "170000" } },
    { business: { ...deal.business, industry: "unknown" } },
    { business: { ...deal.business, annualRevenue: null } },
    { business: { ...deal.business, numberOfEmployees: 1.5 } },
    { business: { ...deal.business, growthRate: 1e200 } },
    { financing: { ...deal.financing, loanTermYears: 1e10 } },
    { financing: { ...deal.financing, interestRate: -1 } },
    { financing: { ...deal.financing, sellerFinancing: {} } },
    { financing: { ...deal.financing, sellerFinancing: { amount: 10, interestRate: 0, termYears: 1e10 } } },
    { financing: { ...deal.financing, closingCosts: "0" } },
    { id: " " }, { updatedAt: "invalid" }, { updatedAt: "9999-01-01T00:00:00.000Z" }, { needsListingReview: "false" },
    { listingSource: null },
  ])("rejects invalid nested inputs or metadata: %j", (patch) => {
    expect(() => parseDealExport(JSON.stringify({ schemaVersion: 2, deal: { ...deal, ...patch } }))).toThrow();
  });

  it("rejects overflowing JSON numbers without coercion", () => {
    expect(() => parseDealExport(serializeDeal(deal).replace('"sde": 170000', '"sde": 1e400'))).toThrow();
  });

  it.each([
    { schemaVersion: 2, deal, unsupportedEnvelopeField: true },
    { schemaVersion: 2, deal: { ...deal, unsupportedDealField: true } },
    { schemaVersion: 2, deal: { ...deal, business: { ...deal.business, normalizedEarnings: 170000 } } },
    { schemaVersion: 2, deal: { ...deal, financing: { ...deal.financing, balloonPayment: 50000 } } },
    { schemaVersion: 2, deal: { ...deal, financing: { ...deal.financing, sellerFinancing: { amount: 100, interestRate: 0, termYears: 1, defermentMonths: 6 } } } },
    { schemaVersion: 2, deal: { ...deal, evidence: { purchasePrice: "listing", authenticated: true } } },
    { schemaVersion: 2, deal: { ...deal, evidence: { purchasePrice: "verified" } } },
  ])("rejects unsupported fields or evidence labels instead of silently discarding them: %j", (payload) => {
    expect(() => parseDealExport(JSON.stringify(payload))).toThrow("valid Acquisition Lens export");
  });

  it("preserves losses, zeros, fractional terms, seller financing and evidence", () => {
    const original: SavedDeal = { ...deal, needsListingReview: true,
      business: { ...deal.business, sde: -100, ebitda: 0, growthRate: -.2 },
      financing: { ...deal.financing, closingCosts: 0, loanTermYears: 2.5, sellerFinancing: { amount: 100, interestRate: 0, termYears: 1.5 } } };
    const imported = parseDealExport(serializeDeal(original));
    expect(imported).toMatchObject(original);
    expect(serializeDeal(imported)).toBe(serializeDeal(original));
  });

  it("rejects oversized UTF-8 content before parsing", () => {
    expect(() => parseDealExport(" ".repeat(MAX_DEAL_IMPORT_BYTES + 1))).toThrow("256 KiB");
    expect(() => parseDealExport("é".repeat(MAX_DEAL_IMPORT_BYTES / 2 + 1))).toThrow("256 KiB");
  });

  it("preserves listing source and user-selected evidence through export/import", () => {
    const original = { ...deal, listingSource: extractListing("Asking Price: $425,000", "Atlas", "https://example.com/listing"), needsListingReview: true };
    const imported = parseDealExport(serializeDeal(original));
    imported.evidence!.sde = "seller-provided";
    expect(parseDealExport(serializeDeal(imported))).toEqual(imported);
    expect(imported.listingSource?.values.purchasePrice).toBe(425000);
  });

  it("does not read an oversized file", async () => {
    const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));
    await expect(readDealExport({ size: MAX_DEAL_IMPORT_BYTES + 1, arrayBuffer })).rejects.toThrow("256 KiB");
    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it("reads a valid file without modifying financial values", async () => {
    const raw = serializeDeal(deal);
    const bytes = new TextEncoder().encode(raw);
    await expect(readDealExport({ size: bytes.byteLength, arrayBuffer: async () => bytes.buffer })).resolves.toMatchObject(deal);
  });

  it("rejects malformed UTF-8 bytes instead of replacing them", async () => {
    const bytes = new Uint8Array([0x7b, 0x22, 0xc3, 0x28, 0x22, 0x7d]);
    await expect(readDealExport({ size: bytes.byteLength, arrayBuffer: async () => bytes.buffer })).rejects.toThrow("not valid UTF-8");
  });
});
