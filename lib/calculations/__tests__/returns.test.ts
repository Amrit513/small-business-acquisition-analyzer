import { describe, expect, it } from "vitest";
import {
  calculateCashFlow,
  calculateTotalCashInvested,
  calculateReturns,
  calculateBreakEvenSchedule,
} from "@/lib/calculations/returns";
import { summarizeLoan } from "@/lib/calculations/financing";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

const inputs: BusinessInputs = {
  purchasePrice: 450000,
  annualRevenue: 800000,
  sde: 180000,
  ebitda: 150000,
  growthRate: 0.05,
  industry: "service",
  numberOfEmployees: 6,
  currentExpenses: 620000,
  ownerSalary: 70000,
};

const financing: FinancingInputs = {
  downPayment: 100000,
  loanAmount: 350000,
  interestRate: 0.095,
  loanTermYears: 10,
  closingCosts: 15000,
};

describe("calculateCashFlow", () => {
  it("computes annual cash flow as SDE minus annual debt service", () => {
    const loan = summarizeLoan(financing);
    const cashFlow = calculateCashFlow(inputs, loan);
    expect(cashFlow.annualCashFlowAfterDebt).toBeCloseTo(
      inputs.sde - loan.annualDebtService,
      2
    );
  });

  it("computes monthly cash flow as annual / 12", () => {
    const loan = summarizeLoan(financing);
    const cashFlow = calculateCashFlow(inputs, loan);
    expect(cashFlow.monthlyCashFlowAfterDebt).toBeCloseTo(
      cashFlow.annualCashFlowAfterDebt / 12,
      2
    );
  });
});

describe("calculateTotalCashInvested", () => {
  it("sums down payment and closing costs", () => {
    expect(calculateTotalCashInvested(financing)).toBe(115000);
  });

  it("defaults closing costs to 0 when omitted", () => {
    const { closingCosts, ...withoutClosingCosts } = financing;
    expect(calculateTotalCashInvested(withoutClosingCosts as FinancingInputs)).toBe(100000);
  });
});

describe("calculateReturns", () => {
  it("computes cash-on-cash ROI as annual cash flow / total cash invested", () => {
    const loan = summarizeLoan(financing);
    const cashFlow = calculateCashFlow(inputs, loan);
    const returns = calculateReturns(financing, cashFlow);
    const totalInvested = calculateTotalCashInvested(financing);
    expect(returns.cashOnCashROI).toBeCloseTo(
      cashFlow.annualCashFlowAfterDebt / totalInvested,
      2
    );
  });

  it("keeps payback unavailable when cash flow after debt is nonpositive", () => {
    const badFinancing: FinancingInputs = {
      downPayment: 20000,
      loanAmount: 700000,
      interestRate: 0.14,
      loanTermYears: 5,
    };
    const loan = summarizeLoan(badFinancing);
    const cashFlow = calculateCashFlow(inputs, loan);
    const returns = calculateReturns(badFinancing, cashFlow);
    expect(returns.cashOnCashROI).toBeLessThanOrEqual(0);
    expect(returns.paybackPeriodYears).toBeNull();
    expect(JSON.stringify(returns)).not.toContain("Infinity");
  });

  it("does not turn zero buyer cash into a zero return or immediate payback", () => {
    const zeroCash: FinancingInputs = { downPayment: 0, loanAmount: 450000, interestRate: 0.095, loanTermYears: 10, closingCosts: 0 };
    const returns = calculateReturns(zeroCash, calculateCashFlow(inputs, summarizeLoan(zeroCash)));
    expect(returns).toMatchObject({ totalCashInvested: 0, cashOnCashROI: null, paybackPeriodYears: null });
  });
});

describe("calculateBreakEvenSchedule", () => {
  it("starts negative (reflecting the initial cash outlay)", () => {
    const loan = summarizeLoan(financing);
    const cashFlow = calculateCashFlow(inputs, loan);
    const schedule = calculateBreakEvenSchedule(financing, cashFlow);
    const firstMonth = schedule.at(0);
    expect(firstMonth).toBeDefined();
    expect(firstMonth!.cumulativeCashFlow).toBeLessThan(0);
  });

  it("eventually crosses zero when cash flow after debt is positive", () => {
    const loan = summarizeLoan(financing);
    const cashFlow = calculateCashFlow(inputs, loan);
    const schedule = calculateBreakEvenSchedule(financing, cashFlow, 240);
    const last = schedule.at(-1);
    expect(last).toBeDefined();
    expect(last!.cumulativeCashFlow).toBeGreaterThanOrEqual(0);
  });

  it("stops projecting once break-even is reached (does not run the full window)", () => {
    const loan = summarizeLoan(financing);
    const cashFlow = calculateCashFlow(inputs, loan);
    const schedule = calculateBreakEvenSchedule(financing, cashFlow, 240);
    expect(schedule.length).toBeLessThan(240);
  });
});
