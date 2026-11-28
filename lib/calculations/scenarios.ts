import type {
  BusinessInputs,
  GrowthScenario,
  LoanSummary,
  ScenarioAssumptions,
} from "@/types/business";
import { calculateCashFlow } from "@/lib/calculations/returns";
import { roundToCents } from "@/lib/calculations/valuation";

/**
 * Default assumptions for the three standard scenarios. These are
 * starting points, not universal truths — a UI should let a user override
 * revenueGrowthRate/expenseGrowthRate directly (that's the "custom" scenario).
 */
export const DEFAULT_SCENARIO_ASSUMPTIONS: Record<
  Exclude<GrowthScenario, "custom">,
  Omit<ScenarioAssumptions, "scenario">
> = {
  conservative: { revenueGrowthRate: 0.0, expenseGrowthRate: 0.02, projectionYears: 5 },
  expected: { revenueGrowthRate: 0.05, expenseGrowthRate: 0.03, projectionYears: 5 },
  aggressive: { revenueGrowthRate: 0.15, expenseGrowthRate: 0.05, projectionYears: 5 },
};

export function buildScenarioAssumptions(
  scenario: GrowthScenario,
  overrides?: Partial<Omit<ScenarioAssumptions, "scenario">>
): ScenarioAssumptions {
  const base =
    scenario === "custom"
      ? DEFAULT_SCENARIO_ASSUMPTIONS.expected // sensible fallback base for custom
      : DEFAULT_SCENARIO_ASSUMPTIONS[scenario];

  return {
    scenario,
    revenueGrowthRate: overrides?.revenueGrowthRate ?? base.revenueGrowthRate,
    expenseGrowthRate: overrides?.expenseGrowthRate ?? base.expenseGrowthRate,
    projectionYears: overrides?.projectionYears ?? base.projectionYears,
  };
}

export interface YearProjection {
  year: number;
  revenue: number;
  expenses: number;
  sde: number;
  /** Unverified reconciliation to entered baseline SDE; held flat in nominal dollars. */
  earningsReconciliation: number;
  annualDebtService: number;
  annualCashFlowAfterDebt: number;
}

/**
 * Projects revenue, expenses, and resulting SDE/cash flow forward under a
 * given scenario's growth assumptions. Preserve entered SDE with a visible,
 * fixed-dollar reconciliation, not an invented add-back. Debt service is the
 * sum of actual scheduled payments in each projected year, stopping at maturity.
 * This is a pretax screening model, not a lender-specific cash-flow forecast.
 */
export function projectScenario(
  inputs: BusinessInputs,
  loan: LoanSummary,
  assumptions: ScenarioAssumptions
): YearProjection[] {
  if (!Number.isInteger(assumptions.projectionYears) || assumptions.projectionYears < 1 || assumptions.projectionYears > 10
    || ![assumptions.revenueGrowthRate, assumptions.expenseGrowthRate].every(rate => Number.isFinite(rate) && rate >= -1 && rate <= 10)) {
    throw new Error("Scenarios require 1–10 whole years and growth rates between -100% and 1000%.");
  }
  const projections: YearProjection[] = [];

  let revenue = inputs.annualRevenue;
  let expenses = inputs.currentExpenses;
  const earningsReconciliation = roundToCents(inputs.sde - (inputs.annualRevenue - inputs.currentExpenses));

  for (let year = 1; year <= assumptions.projectionYears; year++) {
    revenue = roundToCents(revenue * (1 + assumptions.revenueGrowthRate));
    expenses = roundToCents(expenses * (1 + assumptions.expenseGrowthRate));

    const sde = roundToCents(revenue - expenses + earningsReconciliation);
    const annualDebtService = roundToCents(loan.amortizationSchedule
      .filter(row => row.month > (year - 1) * 12 && row.month <= year * 12)
      .reduce((total, row) => total + row.payment, 0));

    const annualCashFlowAfterDebt = roundToCents(sde - annualDebtService);

    projections.push({ year, revenue, expenses, sde, earningsReconciliation, annualDebtService, annualCashFlowAfterDebt });
  }

  return projections;
}

/** Convenience: run all three standard scenarios at once for side-by-side comparison. */
export function projectAllStandardScenarios(
  inputs: BusinessInputs,
  loan: LoanSummary,
  projectionYears = 5
): Record<Exclude<GrowthScenario, "custom">, YearProjection[]> {
  return {
    conservative: projectScenario(
      inputs,
      loan,
      buildScenarioAssumptions("conservative", { projectionYears })
    ),
    expected: projectScenario(
      inputs,
      loan,
      buildScenarioAssumptions("expected", { projectionYears })
    ),
    aggressive: projectScenario(
      inputs,
      loan,
      buildScenarioAssumptions("aggressive", { projectionYears })
    ),
  };
}

/** Re-export so consumers only need to import from one place if desired. */
export { calculateCashFlow };
