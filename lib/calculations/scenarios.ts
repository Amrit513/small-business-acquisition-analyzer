import type {
  BusinessInputs,
  FinancingInputs,
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
  annualCashFlowAfterDebt: number;
}

/**
 * Projects revenue, expenses, and resulting SDE/cash flow forward under a
 * given scenario's growth assumptions. Debt service is held constant
 * (a fixed-rate loan doesn't change with performance), so improved SDE
 * flows straight through to improved cash flow — this is what lets a user
 * see "what happens if revenue grows 5%/year for 5 years."
 *
 * Simplifying assumption: SDE margin (SDE / Revenue) is held constant
 * unless expenses are explicitly grown faster than revenue, in which case
 * margin compresses. This keeps the model transparent and auditable
 * rather than trying to model every line item independently.
 */
export function projectScenario(
  inputs: BusinessInputs,
  loan: LoanSummary,
  assumptions: ScenarioAssumptions
): YearProjection[] {
  const projections: YearProjection[] = [];

  let revenue = inputs.annualRevenue;
  let expenses = inputs.currentExpenses;

  for (let year = 1; year <= assumptions.projectionYears; year++) {
    revenue = roundToCents(revenue * (1 + assumptions.revenueGrowthRate));
    expenses = roundToCents(expenses * (1 + assumptions.expenseGrowthRate));

    // SDE = Revenue - Expenses (expenses here exclude owner salary, per
    // the SDE definition, since SDE already adds owner comp back).
    const sde = roundToCents(revenue - expenses);

    const annualCashFlowAfterDebt = roundToCents(sde - loan.annualDebtService);

    projections.push({ year, revenue, expenses, sde, annualCashFlowAfterDebt });
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
