import { describe, expect, it } from "vitest";
import {
  calculateMonthlyLoanPayment,
  buildAmortizationSchedule,
  summarizeLoan,
  calculateDSCR,
  calculateFundingGap,
} from "@/lib/calculations/financing";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

describe("calculateMonthlyLoanPayment", () => {
  it("matches a known amortization result (standard formula check)", () => {
    // $300,000 loan, 10% annual rate, 10-year term -> known payment ~$3,964.53
    const payment = calculateMonthlyLoanPayment(300000, 0.1, 10);
    expect(payment).toBeCloseTo(3964.53, 1);
  });

  it("handles 0% interest as straight-line principal payments", () => {
    const payment = calculateMonthlyLoanPayment(120000, 0, 10);
    expect(payment).toBeCloseTo(1000, 2); // 120000 / 120 months
  });

  it("rounds the financed principal to cents before calculating payment", () => {
    expect(calculateMonthlyLoanPayment(1.005, 0, 1 / 6)).toBe(0.51);
  });

  it("returns 0 for a 0 or negative principal", () => {
    expect(calculateMonthlyLoanPayment(0, 0.1, 10)).toBe(0);
    expect(calculateMonthlyLoanPayment(-500, 0.1, 10)).toBe(0);
  });
});

describe("buildAmortizationSchedule", () => {
  it("fully amortizes to a zero balance by the final month", () => {
    const schedule = buildAmortizationSchedule(200000, 0.08, 5);
    expect(schedule).toHaveLength(60);
    const lastRow = schedule.at(-1);
    expect(lastRow).toBeDefined();
    expect(lastRow!.remainingBalance).toBe(0);
  });

  it("decreases interest and increases principal portion over time", () => {
    const schedule = buildAmortizationSchedule(200000, 0.08, 5);
    const first = schedule.at(0);
    const last = schedule.at(-1);
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    expect(last!.interest).toBeLessThan(first!.interest);
    expect(last!.principal).toBeGreaterThan(first!.principal);
  });

  it("keeps every row at cent precision and reconciles a fractional-cent principal", () => {
    const schedule = buildAmortizationSchedule(1.005, 0, 1 / 6);
    const hasCentPrecision = (value: number) => Number.isInteger(value * 100);
    expect(schedule).toHaveLength(2);
    expect(schedule.every(row => [row.payment, row.principal, row.interest, row.remainingBalance].every(hasCentPrecision))).toBe(true);
    expect(schedule.reduce((total, row) => total + row.principal, 0)).toBe(1.01);
    expect(schedule.at(-1)?.remainingBalance).toBe(0);
    expect(buildAmortizationSchedule(0.004, 0, 1)).toEqual([]);
  });
});

describe("summarizeLoan", () => {
  const financing: FinancingInputs = {
    downPayment: 100000,
    loanAmount: 300000,
    interestRate: 0.095,
    loanTermYears: 10,
    closingCosts: 15000,
  };

  it("computes annual debt service as 12x the monthly payment", () => {
    const loan = summarizeLoan(financing);
    expect(loan.annualDebtService).toBeCloseTo(loan.monthlyPayment * 12, 2);
  });

  it("combines seller financing into the total monthly payment", () => {
    const withSeller: FinancingInputs = {
      ...financing,
      sellerFinancing: { amount: 50000, interestRate: 0.06, termYears: 5 },
    };
    const withoutSeller = summarizeLoan(financing);
    const with_ = summarizeLoan(withSeller);
    expect(with_.monthlyPayment).toBeGreaterThan(withoutSeller.monthlyPayment);
  });

  it("sums only payments actually scheduled in the first year", () => {
    const loan = summarizeLoan({
      downPayment: 0,
      loanAmount: 0,
      interestRate: 0,
      loanTermYears: 0,
      sellerFinancing: { amount: 3000, interestRate: 0, termYears: 0.5 },
    });
    expect(loan.monthlyPayment).toBe(500);
    expect(loan.amortizationSchedule).toHaveLength(6);
    expect(loan.annualDebtService).toBe(3000);
    expect(loan.annualDebtService).not.toBe(loan.monthlyPayment * 12);
  });
});

describe("calculateFundingGap", () => {
  it("returns zero when the proposed sources balance", () => {
    expect(calculateFundingGap(450000, {
      downPayment: 100000,
      loanAmount: 300000,
      interestRate: 0.09,
      loanTermYears: 10,
      sellerFinancing: { amount: 50000, interestRate: 0.06, termYears: 5 },
    })).toBe(0);
  });

  it("identifies a gap and excess funding", () => {
    const financing = { downPayment: 50000, loanAmount: 300000, interestRate: 0.09, loanTermYears: 10 };
    expect(calculateFundingGap(400000, financing)).toBe(50000);
    expect(calculateFundingGap(300000, financing)).toBe(-50000);
  });
});

describe("calculateDSCR", () => {
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

  it("rates a DSCR >= 1.25 above the illustrative screening threshold", () => {
    const loan = summarizeLoan({
      downPayment: 100000,
      loanAmount: 300000,
      interestRate: 0.06,
      loanTermYears: 10,
    });
    const result = calculateDSCR(inputs, loan);
    expect(result.dscr).toBeGreaterThanOrEqual(1.25);
    expect(result.rating).toBe("strong");
    expect(result.meetsIllustrativeThreshold).toBe(true);
  });

  it("rates a critically low DSCR when debt service overwhelms SDE", () => {
    const loan = summarizeLoan({
      downPayment: 20000,
      loanAmount: 1500000,
      interestRate: 0.13,
      loanTermYears: 7,
    });
    const result = calculateDSCR(inputs, loan);
    expect(result.dscr).toBeLessThan(0.8);
    expect(result.rating).toBe("critical");
    expect(result.meetsIllustrativeThreshold).toBe(false);
  });

  it("reports coverage as inapplicable when there is no scheduled debt", () => {
    const loan = summarizeLoan({
      downPayment: 450000,
      loanAmount: 0,
      interestRate: 0,
      loanTermYears: 0,
    });
    const result = calculateDSCR(inputs, loan);
    expect(result).toEqual({ dscr: null, rating: "not-applicable", meetsIllustrativeThreshold: null });
    expect(JSON.stringify(result)).not.toContain("Infinity");
  });
});
