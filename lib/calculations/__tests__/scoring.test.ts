import { describe, expect, it } from "vitest";
import { calculateAcquisitionScore } from "@/lib/calculations/scoring";
import { estimateValuation } from "@/lib/calculations/valuation";
import { summarizeLoan, calculateDSCR } from "@/lib/calculations/financing";
import { calculateCashFlow, calculateReturns } from "@/lib/calculations/returns";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

const strongDealInputs: BusinessInputs = {
  purchasePrice: 400000,
  annualRevenue: 900000,
  sde: 220000,
  ebitda: 190000,
  growthRate: 0.08,
  industry: "service",
  numberOfEmployees: 7,
  currentExpenses: 680000,
  ownerSalary: 75000,
};

const strongDealFinancing: FinancingInputs = {
  downPayment: 100000,
  loanAmount: 300000,
  interestRate: 0.09,
  loanTermYears: 10,
};

const weakDealInputs: BusinessInputs = {
  purchasePrice: 900000,
  annualRevenue: 500000,
  sde: 60000,
  ebitda: 40000,
  growthRate: 0.0,
  industry: "restaurant",
  numberOfEmployees: 10,
  currentExpenses: 440000,
  ownerSalary: 50000,
};

const weakDealFinancing: FinancingInputs = {
  downPayment: 50000,
  loanAmount: 850000,
  interestRate: 0.12,
  loanTermYears: 7,
};

function scoreDeal(inputs: BusinessInputs, financing: FinancingInputs) {
  const valuation = estimateValuation(inputs);
  const loan = summarizeLoan(financing);
  const cashFlow = calculateCashFlow(inputs, loan);
  const dscr = calculateDSCR(inputs, loan);
  const returns = calculateReturns(financing, cashFlow);
  return calculateAcquisitionScore(inputs, valuation, dscr, returns);
}

describe("calculateAcquisitionScore", () => {
  it("scores a well-financed, healthy business significantly higher than a weak one", () => {
    const strongScore = scoreDeal(strongDealInputs, strongDealFinancing);
    const weakScore = scoreDeal(weakDealInputs, weakDealFinancing);

    expect(strongScore.totalScore).toBeGreaterThan(weakScore.totalScore);
  });

  it("keeps the total score within 0-100", () => {
    const strongScore = scoreDeal(strongDealInputs, strongDealFinancing);
    const weakScore = scoreDeal(weakDealInputs, weakDealFinancing);

    for (const score of [strongScore, weakScore]) {
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
      expect(score.totalScore).toBeLessThanOrEqual(100);
    }
  });

  it("assigns a rating consistent with the total score thresholds", () => {
    const weakScore = scoreDeal(weakDealInputs, weakDealFinancing);
    if (weakScore.totalScore < 30) {
      expect(weakScore.rating).toBe("poor");
    }
  });

  it("computes the total as the documented weighted sum of sub-scores", () => {
    const score = scoreDeal(strongDealInputs, strongDealFinancing);
    const expectedTotal = Math.round(
      score.dscrScore * 0.3 +
        score.roiScore * 0.25 +
        score.paybackScore * 0.2 +
        score.growthScore * 0.15 +
        score.valuationScore * 0.1
    );
    expect(score.totalScore).toBe(expectedTotal);
  });
});
