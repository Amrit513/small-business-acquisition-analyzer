import type {
  AmortizationRow,
  BusinessInputs,
  DSCRResult,
  FinancingInputs,
  LoanSummary,
} from "@/types/business";
import { roundToCents, roundToHundredths } from "@/lib/calculations/valuation";

/**
 * Calculates the fixed monthly payment for an amortizing loan using the
 * standard amortization formula:
 *
 *   M = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
 *
 * where:
 *   P = principal (loan amount)
 *   r = monthly interest rate (annual rate / 12)
 *   n = total number of monthly payments (years * 12)
 *
 * Special-cased for a 0% interest rate (straight-line principal payments),
 * since the standard formula divides by zero when r = 0.
 */
export function calculateMonthlyLoanPayment(
  principal: number,
  annualInterestRate: number,
  termYears: number
): number {
  if (principal <= 0 || termYears <= 0) return 0;

  const n = termYears * 12;
  if (annualInterestRate === 0) {
    return roundToCents(principal / n);
  }

  const r = annualInterestRate / 12;
  const payment = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  return roundToCents(payment);
}

/** Builds a full month-by-month amortization schedule for one loan. */
export function buildAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  termYears: number
): AmortizationRow[] {
  if (principal <= 0 || termYears <= 0) return [];

  const n = termYears * 12;
  const monthlyPayment = calculateMonthlyLoanPayment(principal, annualInterestRate, termYears);
  const r = annualInterestRate / 12;

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= n; month++) {
    const interest = roundToCents(balance * r);
    // On the final payment, pay off whatever balance remains to avoid
    // leaving a fractional-cent remainder due to rounding.
    const isLastMonth = month === n;
    const principalPortion = isLastMonth
      ? balance
      : roundToCents(monthlyPayment - interest);
    balance = roundToCents(balance - principalPortion);

    schedule.push({
      month,
      payment: roundToCents(principalPortion + interest),
      principal: principalPortion,
      interest,
      remainingBalance: Math.max(balance, 0),
    });
  }

  return schedule;
}

/**
 * Combines the primary acquisition loan with optional seller financing into
 * a single loan summary. Seller financing is common in small-business deals
 * and typically runs alongside (not instead of) bank financing.
 */
export function summarizeLoan(financing: FinancingInputs): LoanSummary {
  const primarySchedule = buildAmortizationSchedule(
    financing.loanAmount,
    financing.interestRate,
    financing.loanTermYears
  );

  const sellerSchedule = financing.sellerFinancing
    ? buildAmortizationSchedule(
        financing.sellerFinancing.amount,
        financing.sellerFinancing.interestRate,
        financing.sellerFinancing.termYears
      )
    : [];

  const primaryMonthlyPayment = calculateMonthlyLoanPayment(
    financing.loanAmount,
    financing.interestRate,
    financing.loanTermYears
  );
  const sellerMonthlyPayment = financing.sellerFinancing
    ? calculateMonthlyLoanPayment(
        financing.sellerFinancing.amount,
        financing.sellerFinancing.interestRate,
        financing.sellerFinancing.termYears
      )
    : 0;

  const monthlyPayment = roundToCents(primaryMonthlyPayment + sellerMonthlyPayment);
  const annualDebtService = roundToCents(monthlyPayment * 12);

  const totalInterestPaid = roundToCents(
    sumInterest(primarySchedule) + sumInterest(sellerSchedule)
  );

  // Merge schedules month-by-month for a combined view when seller
  // financing is present; otherwise just use the primary schedule.
  const amortizationSchedule = mergeSchedules(primarySchedule, sellerSchedule);

  return {
    monthlyPayment,
    annualDebtService,
    totalInterestPaid,
    amortizationSchedule,
  };
}

/** Purchase price not covered by the proposed sources of funds. */
export function calculateFundingGap(
  purchasePrice: number,
  financing: FinancingInputs
): number {
  const sellerAmount = financing.sellerFinancing?.amount ?? 0;
  return roundToCents(
    purchasePrice - financing.downPayment - financing.loanAmount - sellerAmount
  );
}

function sumInterest(schedule: AmortizationRow[]): number {
  return schedule.reduce((total, row) => total + row.interest, 0);
}

function mergeSchedules(
  primary: AmortizationRow[],
  seller: AmortizationRow[]
): AmortizationRow[] {
  if (seller.length === 0) return primary;

  const maxMonths = Math.max(primary.length, seller.length);
  const merged: AmortizationRow[] = [];

  for (let i = 0; i < maxMonths; i++) {
    const p = primary[i];
    const s = seller[i];
    merged.push({
      month: i + 1,
      payment: roundToCents((p?.payment ?? 0) + (s?.payment ?? 0)),
      principal: roundToCents((p?.principal ?? 0) + (s?.principal ?? 0)),
      interest: roundToCents((p?.interest ?? 0) + (s?.interest ?? 0)),
      remainingBalance: roundToCents(
        (p?.remainingBalance ?? 0) + (s?.remainingBalance ?? 0)
      ),
    });
  }

  return merged;
}

/**
 * Debt Service Coverage Ratio (DSCR) — the single most important metric
 * a lender (especially SBA lenders) looks at when underwriting a business
 * acquisition loan.
 *
 *   DSCR = Annual Net Operating Income (SDE) / Annual Total Debt Service
 *
 * Interpretation (aligned with common SBA underwriting norms):
 *   >= 1.25 : strong / bankable
 *   1.0 - 1.25 : acceptable but thin — many lenders require 1.15-1.25 minimum
 *   0.8 - 1.0 : weak — the business barely or doesn't cover its own debt
 *   < 0.8 : critical — the business cannot service this debt load as structured
 */
export function calculateDSCR(inputs: BusinessInputs, loan: LoanSummary): DSCRResult {
  if (loan.annualDebtService === 0) {
    return { dscr: Infinity, rating: "strong", meetsTypicalLenderMinimum: true };
  }

  const dscr = roundToHundredths(inputs.sde / loan.annualDebtService);

  let rating: DSCRResult["rating"];
  if (dscr >= 1.25) rating = "strong";
  else if (dscr >= 1.0) rating = "acceptable";
  else if (dscr >= 0.8) rating = "weak";
  else rating = "critical";

  return {
    dscr,
    rating,
    meetsTypicalLenderMinimum: dscr >= 1.25,
  };
}
