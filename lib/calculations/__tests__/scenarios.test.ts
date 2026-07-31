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
