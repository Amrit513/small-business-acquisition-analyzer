import { describe, expect, it } from "vitest";
import { parseDealExport, serializeDeal, type SavedDeal } from "@/lib/storage/analyses";

const deal: SavedDeal = { id: "deal-1", name: "Atlas", updatedAt: "2026-08-17T00:00:00.000Z", business: { purchasePrice: 425000, annualRevenue: 520000, sde: 170000, ebitda: 125000, growthRate: .07, industry: "service", numberOfEmployees: 6, currentExpenses: 350000, ownerSalary: 80000 }, financing: { downPayment: 85000, loanAmount: 340000, interestRate: .095, loanTermYears: 10 } };

describe("deal export evidence migration", () => {
  it("exports version two with normalized evidence", () => {
    const parsed = JSON.parse(serializeDeal(deal)) as { schemaVersion: number; deal: SavedDeal };
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.deal.evidence?.purchasePrice).toBe("listing");
  });

  it("imports legacy version-one deals with conservative defaults", () => {
    const imported = parseDealExport(JSON.stringify({ schemaVersion: 1, deal }));
    expect(imported.evidence?.sde).toBe("unverified");
  });
});
