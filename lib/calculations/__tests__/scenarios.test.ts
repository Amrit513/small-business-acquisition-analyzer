import { describe, expect, it } from "vitest";
import {
  buildScenarioAssumptions,
  projectScenario,
  projectAllStandardScenarios,
} from "@/lib/calculations/scenarios";
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
};

describe("buildScenarioAssumptions", () => {
  it("uses documented defaults for conservative/expected/aggressive", () => {
    expect(buildScenarioAssumptions("conservative").revenueGrowthRate).toBe(0.0);
    expect(buildScenarioAssumptions("expected").revenueGrowthRate).toBe(0.05);
    expect(buildScenarioAssumptions("aggressive").revenueGrowthRate).toBe(0.15);
  });

  it("allows overriding individual assumptions for a custom scenario", () => {
    const custom = buildScenarioAssumptions("custom", { revenueGrowthRate: 0.22 });
    expect(custom.revenueGrowthRate).toBe(0.22);
    expect(custom.scenario).toBe("custom");
  });
});

describe("projectScenario", () => {
  const flat = buildScenarioAssumptions("custom", { revenueGrowthRate: 0, expenseGrowthRate: 0, projectionYears: 3 });

  it("keeps entered earnings when revenue less expenses does not equal SDE", () => {
    const debtFree = summarizeLoan({ ...financing, loanAmount: 0 });
    const result = projectScenario({ ...inputs, sde: 150000 }, debtFree, flat);
    // 800,000 - 620,000 = 180,000; reconciliation = 150,000 - 180,000 = -30,000.
    expect(result.map(row => row.sde)).toEqual([150000, 150000, 150000]);
    expect(result[0]?.earningsReconciliation).toBe(-30000);
    expect(result[0]?.annualDebtService).toBe(0);
  });

  it("applies growth only to revenue and expenses, keeping reconciliation visible and flat", () => {
    const result = projectScenario({ ...inputs, sde: 200000 }, summarizeLoan({ ...financing, loanAmount: 0 }),
      { ...flat, revenueGrowthRate: .1, expenseGrowthRate: .05 });
    // 880,000 - 651,000 + 20,000 = 249,000, not an assumed constant margin.
    expect(result[0]?.sde).toBe(249000);
    expect(result[0]?.earningsReconciliation).toBe(20000);
  });

  it("stops each debt stream at its own maturity", () => {
    const loan = summarizeLoan({ downPayment: 0, loanAmount: 24000, interestRate: 0, loanTermYears: 2,
      sellerFinancing: { amount: 12000, interestRate: 0, termYears: 1 } });
    const result = projectScenario(inputs, loan, flat);
    // Bank: $1,000/month for 24 months. Seller: $1,000/month for 12 months.
    expect(result.map(row => row.annualDebtService)).toEqual([24000, 12000, 0]);
    expect(result.map(row => row.annualCashFlowAfterDebt)).toEqual([156000, 168000, 180000]);
  });

  it("sums partial-year debt and preserves legitimate losses", () => {
    const loan = summarizeLoan({ downPayment: 0, loanAmount: 18000, interestRate: 0, loanTermYears: 1.5 });
    const result = projectScenario({ ...inputs, sde: -5000 }, loan, flat);
    expect(result.map(row => row.annualDebtService)).toEqual([12000, 6000, 0]);
    expect(result.map(row => row.annualCashFlowAfterDebt)).toEqual([-17000, -11000, -5000]);
  });

  it.each([0, 11, 1.5, Infinity, NaN])("rejects unsupported projection horizon %s", projectionYears => {
    expect(() => projectScenario(inputs, summarizeLoan(financing), { ...flat, projectionYears })).toThrow();
  });

  it.each([-1.01, 10.01, Infinity, NaN])("rejects unsupported growth %s", rate => {
    expect(() => projectScenario(inputs, summarizeLoan(financing), { ...flat, revenueGrowthRate: rate })).toThrow();
    expect(() => projectScenario(inputs, summarizeLoan(financing), { ...flat, expenseGrowthRate: rate })).toThrow();
  });

  it("compounds revenue growth year over year", () => {
    const loan = summarizeLoan(financing);
    const assumptions = buildScenarioAssumptions("expected", { projectionYears: 3 });
    const projections = projectScenario(inputs, loan, assumptions);

    expect(projections).toHaveLength(3);
    const yearOne = projections.at(0);
    const yearTwo = projections.at(1);
    expect(yearOne).toBeDefined();
    expect(yearTwo).toBeDefined();
    expect(yearOne!.revenue).toBeCloseTo(800000 * 1.05, 0);
    expect(yearTwo!.revenue).toBeCloseTo(800000 * 1.05 * 1.05, 0);
  });

  it("produces higher SDE growth under aggressive vs conservative scenarios", () => {
    const loan = summarizeLoan(financing);
    const conservative = projectScenario(
      inputs,
      loan,
      buildScenarioAssumptions("conservative", { projectionYears: 5 })
    );
    const aggressive = projectScenario(
      inputs,
      loan,
      buildScenarioAssumptions("aggressive", { projectionYears: 5 })
    );

    const conservativeFinal = conservative.at(-1);
    const aggressiveFinal = aggressive.at(-1);
    expect(conservativeFinal).toBeDefined();
    expect(aggressiveFinal).toBeDefined();
    expect(aggressiveFinal!.sde).toBeGreaterThan(conservativeFinal!.sde);
  });
});

describe("projectAllStandardScenarios", () => {
  it("returns all three standard scenarios keyed by name", () => {
    const loan = summarizeLoan(financing);
    const all = projectAllStandardScenarios(inputs, loan, 5);
    expect(Object.keys(all).sort()).toEqual(["aggressive", "conservative", "expected"]);
    expect(all.expected).toHaveLength(5);
  });
});
