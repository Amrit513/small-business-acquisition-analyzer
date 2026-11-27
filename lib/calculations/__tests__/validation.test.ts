import { describe, expect, it } from "vitest";
import { summarizeInputIntegrity, validateDealInputs } from "@/lib/calculations/validation";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

const business: BusinessInputs = { purchasePrice: 425000, annualRevenue: 520000, sde: 170000, ebitda: 125000, growthRate: .07, industry: "service", numberOfEmployees: 6, currentExpenses: 350000, ownerSalary: 80000 };
const financing: FinancingInputs = { downPayment: 85000, loanAmount: 340000, interestRate: .095, loanTermYears: 10, closingCosts: 18000 };

describe("deal input integrity", () => {
  it("accepts the internally consistent sample deal", () => {
    expect(validateDealInputs(business, financing)).toEqual([]);
  });

  it("blocks non-positive core inputs and missing loan terms", () => {
    const issues = validateDealInputs({ ...business, purchasePrice: 0, annualRevenue: 0 }, { ...financing, loanTermYears: 0 });
    expect(issues.filter((issue) => issue.severity === "blocking").map((issue) => issue.field)).toEqual(["purchasePrice", "annualRevenue", "loanTermYears"]);
    expect(summarizeInputIntegrity(issues).isDecisionReady).toBe(false);
  });

  it("flags unusual earnings relationships and an incomplete capital stack", () => {
    const issues = validateDealInputs({ ...business, sde: 600000, ebitda: 650000 }, { ...financing, loanAmount: 300000 });
    expect(issues.map((issue) => issue.id)).toEqual(["sde-above-revenue", "ebitda-above-revenue", "ebitda-above-sde", "funding-mismatch"]);
    expect(summarizeInputIntegrity(issues).warnings).toBe(4);
  });

  it("flags a one-cent funding difference in either direction", () => {
    const short = validateDealInputs(business, { ...financing, loanAmount: 339999.99 });
    const excess = validateDealInputs(business, { ...financing, loanAmount: 340000.01 });

    expect(short.find((issue) => issue.id === "funding-mismatch")?.title).toBe("Capital stack has a funding gap");
    expect(excess.find((issue) => issue.id === "funding-mismatch")?.title).toBe("Capital stack exceeds the purchase price");
  });
});
