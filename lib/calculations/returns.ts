import type {
  BreakEvenPoint,
  BusinessInputs,
  CashFlowResult,
  FinancingInputs,
  LoanSummary,
  ReturnsResult,
} from "@/types/business";
import { calculateProfitMargin, roundToCents, roundToHundredths } from "@/lib/calculations/valuation";

/**
 * Monthly cash flow after debt service — arguably the single most
 * practically important number for a first-time buyer, since it answers
 * "what do I actually take home each month after I buy this and make my
 * loan payments?"
 *
 * We assume the new owner draws the same salary the seller took (already
 * embedded in SDE) unless told otherwise — SDE by definition adds back
 * the previous owner's compensation, so we don't subtract it twice here.
 * The `ownerSalary` field is exposed so a UI can let a user model "what if
 * I pay myself less/more than the seller did."
 */
export function calculateCashFlow(
  inputs: BusinessInputs,
  loan: LoanSummary
): CashFlowResult {
  const annualCashFlowAfterDebt = roundToCents(inputs.sde - loan.annualDebtService);
  const monthlyCashFlowAfterDebt = roundToCents(annualCashFlowAfterDebt / 12);

  return {
    monthlyCashFlowAfterDebt,
    annualCashFlowAfterDebt,
    profitMargin: calculateProfitMargin(inputs),
  };
}

/** Total cash the buyer puts in at close: down payment + closing costs. */
export function calculateTotalCashInvested(financing: FinancingInputs): number {
  return roundToCents(financing.downPayment + (financing.closingCosts ?? 0));
}

/**
 * Cash-on-cash ROI: annual cash flow after debt, divided by positive buyer
 * cash invested. Without positive buyer cash, the ratio is unavailable.
 *
 * Payback period is the inverse: how many years of cash flow it takes to
 * recoup the initial cash investment.
 */
export function calculateReturns(
  financing: FinancingInputs,
  cashFlow: CashFlowResult
): ReturnsResult {
  const totalCashInvested = calculateTotalCashInvested(financing);

  const cashOnCashROI =
    totalCashInvested > 0
      ? roundToHundredths(cashFlow.annualCashFlowAfterDebt / totalCashInvested)
      : null;

  const paybackPeriodYears =
    totalCashInvested > 0 && cashFlow.annualCashFlowAfterDebt > 0
      ? roundToHundredths(totalCashInvested / cashFlow.annualCashFlowAfterDebt)
      : null;

  return {
    totalCashInvested,
    cashOnCashROI,
    paybackPeriodYears,
  };
}

/**
 * Projects cumulative cash flow month-by-month, starting with the initial
 * cash outlay as a negative, until (if ever) it crosses zero — the
 * break-even point for the buyer's cash investment.
 *
 * This ignores revenue growth (see scenarios.ts for growth-adjusted
 * projections) — it's the simple, static "if nothing changes" break-even.
 */
export function calculateBreakEvenSchedule(
  financing: FinancingInputs,
  cashFlow: CashFlowResult,
  monthsToProject = 120
): BreakEvenPoint[] {
  const totalCashInvested = calculateTotalCashInvested(financing);
  const schedule: BreakEvenPoint[] = [];

  let cumulative = -totalCashInvested;
  for (let month = 1; month <= monthsToProject; month++) {
    cumulative = roundToCents(cumulative + cashFlow.monthlyCashFlowAfterDebt);
    schedule.push({ month, cumulativeCashFlow: cumulative });
    if (cumulative >= 0) break; // stop once break-even is reached
  }

  return schedule;
}
