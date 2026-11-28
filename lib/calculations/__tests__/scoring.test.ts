import { describe, expect, it } from "vitest";
import { calculateAcquisitionScore, scoreDSCR, scoreGrowthAndMargin, scorePaybackPeriod, scoreROI, scoreValuation } from "@/lib/calculations/scoring";
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
  it("scores a complete healthy business and suppresses an incomplete index", () => {
    const strongScore = scoreDeal(strongDealInputs, strongDealFinancing);
    const weakScore = scoreDeal(weakDealInputs, weakDealFinancing);

    expect(strongScore.totalScore).not.toBeNull();
    expect(weakScore).toMatchObject({ paybackScore: null, totalScore: null, rating: "unavailable" });
  });

  it("keeps the total score within 0-100", () => {
    const strongScore = scoreDeal(strongDealInputs, strongDealFinancing);
    expect(strongScore.totalScore).not.toBeNull();
    expect(strongScore.totalScore!).toBeGreaterThanOrEqual(0);
    expect(strongScore.totalScore!).toBeLessThanOrEqual(100);
  });

  it("assigns a rating consistent with a complete total score", () => {
    const strongScore = scoreDeal(strongDealInputs, strongDealFinancing);
    expect(strongScore.rating).not.toBe("unavailable");
  });

  it("computes the total as the documented weighted sum of sub-scores", () => {
    const score = scoreDeal(strongDealInputs, strongDealFinancing);
    const expectedTotal = Math.round(
      score.dscrScore! * 0.3 +
        score.roiScore! * 0.25 +
        score.paybackScore! * 0.2 +
        score.growthScore! * 0.15 +
        score.valuationScore! * 0.1
    );
    expect(score.totalScore).toBe(expectedTotal);
  });

  it("does not award a favorable coverage score when debt coverage is inapplicable", () => {
    expect(scoreDSCR({ dscr: null, rating: "not-applicable", meetsIllustrativeThreshold: null })).toBeNull();
  });

  it("does not award return points for unavailable ratios", () => {
    expect(scoreROI(null)).toBeNull();
    expect(scorePaybackPeriod(null)).toBeNull();
  });

  it("bounds finite growth and margin performance to the intended scale", () => {
    expect(scoreGrowthAndMargin({ ...strongDealInputs, sde: -100000, growthRate: -1 })).toBe(0);
    expect(scoreGrowthAndMargin({ ...strongDealInputs, sde: 9000000, growthRate: 10 })).toBe(100);
  });

  it("keeps invalid growth or valuation inputs unavailable", () => {
    expect(scoreGrowthAndMargin({ ...strongDealInputs, annualRevenue: 0 })).toBeNull();
    expect(scoreValuation({ ...strongDealInputs, purchasePrice: 0 }, estimateValuation(strongDealInputs))).toBeNull();
  });
});
