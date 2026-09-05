import { describe, expect, it } from "vitest";
import { generateDealInsights } from "@/lib/calculations/insights";
import { runAnalysis } from "@/lib/calculations";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

const business: BusinessInputs = { purchasePrice: 400000, annualRevenue: 700000, sde: 180000, ebitda: 130000, growthRate: .06, industry: "service", numberOfEmployees: 5, currentExpenses: 520000, ownerSalary: 75000 };
const financing: FinancingInputs = { downPayment: 100000, loanAmount: 300000, interestRate: .08, loanTermYears: 10, closingCosts: 15000 };

describe("generateDealInsights", () => {
  it("recognizes adequate debt coverage and aligned valuation", () => {
    const insights = generateDealInsights(runAnalysis("Healthy", business, financing));
    expect(insights.some((item) => item.id === "dscr-positive")).toBe(true);
    expect(insights.some((item) => item.id === "valuation-aligned")).toBe(true);
  });

  it("flags a debt structure that earnings cannot cover", () => {
    const analysis = runAnalysis("Overleveraged", { ...business, sde: 50000 }, { ...financing, loanAmount: 900000 });
    expect(generateDealInsights(analysis)).toContainEqual(expect.objectContaining({ id: "dscr-critical", severity: "critical" }));
  });

  it("requires evidence for unusually high growth assumptions", () => {
    const analysis = runAnalysis("High growth", { ...business, growthRate: .3 }, financing);
    expect(generateDealInsights(analysis).some((item) => item.id === "growth-proof")).toBe(true);
  });
});
