import { describe, expect, it } from "vitest";
import { buildSensitivityMatrix } from "@/lib/calculations/sensitivity";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

const business: BusinessInputs = {
  purchasePrice: 425000,
  annualRevenue: 520000,
  sde: 170000,
  ebitda: 125000,
  growthRate: 0.07,
  industry: "service",
  numberOfEmployees: 6,
  currentExpenses: 350000,
  ownerSalary: 80000,
};
const financing: FinancingInputs = {
  downPayment: 85000,
  loanAmount: 340000,
  interestRate: 0.095,
  loanTermYears: 10,
  closingCosts: 18000,
};

describe("buildSensitivityMatrix", () => {
  it("creates one cell for every earnings and interest-rate combination", () => {
    const matrix = buildSensitivityMatrix(business, financing);
    expect(matrix).toHaveLength(4);
    expect(matrix.every((row) => row.length === 3)).toBe(true);
  });

  it("shows weaker coverage and cash flow under a harsher combined shock", () => {
    const matrix = buildSensitivityMatrix(business, financing);
    const downside = matrix[0]?.[2];
    const base = matrix[2]?.[0];
    expect(downside).toBeDefined();
    expect(base).toBeDefined();
    expect(downside!.dscr).toBeLessThan(base!.dscr);
    expect(downside!.annualCashFlowAfterDebt).toBeLessThan(base!.annualCashFlowAfterDebt);
  });

  it("does not mutate the supplied assumptions", () => {
    buildSensitivityMatrix(business, financing, [-0.2], [0.02]);
    expect(business.sde).toBe(170000);
    expect(financing.interestRate).toBe(0.095);
  });
});
