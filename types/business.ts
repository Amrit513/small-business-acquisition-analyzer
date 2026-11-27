/**
 * Core domain types for the Small Business Acquisition Analyzer.
 *
 * These types are the contract between the calculation engine
 * (lib/calculations) and everything else (UI, storage, exports).
 * Nothing in this codebase should represent business/financing data
 * with loose `any` objects — always use these types.
 */

export type Industry =
  | "retail"
  | "restaurant"
  | "service"
  | "ecommerce"
  | "manufacturing"
  | "software"
  | "healthcare"
  | "construction"
  | "professional-services"
  | "other";

/** Raw information about the target business being evaluated. */
export interface BusinessInputs {
  /** Asking / agreed purchase price, in dollars. */
  purchasePrice: number;
  /** Trailing twelve months (TTM) annual revenue, in dollars. */
  annualRevenue: number;
  /** Seller's Discretionary Earnings — the standard metric for small (<$1-2M) business valuation. */
  sde: number;
  /** EBITDA, used for larger businesses or as a cross-check against SDE. */
  ebitda: number;
  /** Expected annual revenue growth rate, expressed as a decimal (e.g. 0.05 for 5%). */
  growthRate: number;
  industry: Industry;
  numberOfEmployees: number;
  /** Total annual operating expenses, in dollars (excluding owner salary and debt service). */
  currentExpenses: number;
  /**
   * Current owner's salary/compensation already embedded in SDE.
   * Needed to figure out the new owner's real take-home after replacing the seller.
   */
  ownerSalary: number;
}

/** How the buyer intends to finance the acquisition. */
export interface FinancingInputs {
  downPayment: number;
  loanAmount: number;
  /** Annual interest rate, expressed as a decimal (e.g. 0.095 for 9.5%). */
  interestRate: number;
  /** Loan term in years. */
  loanTermYears: number;
  /** Optional seller financing — a second, typically subordinated loan from the seller. */
  sellerFinancing?: {
    amount: number;
    interestRate: number;
    termYears: number;
  };
  /** Estimated closing costs (legal, due diligence, broker fees), in dollars. */
  closingCosts?: number;
}

export type GrowthScenario = "conservative" | "expected" | "aggressive" | "custom";

export interface ScenarioAssumptions {
  scenario: GrowthScenario;
  /** Annual revenue growth rate for this scenario, as a decimal. */
  revenueGrowthRate: number;
  /** Annual expense growth rate for this scenario, as a decimal. */
  expenseGrowthRate: number;
  /** Number of years to project forward. */
  projectionYears: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  annualDebtService: number;
  totalInterestPaid: number;
  amortizationSchedule: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface ValuationEstimate {
  sdeMethod: number;
  ebitdaMethod: number;
  revenueMethod: number;
  /** Average of the applicable methods — a simple blended estimate. */
  blendedEstimate: number;
  impliedRevenueMultiple: number;
  industryBenchmark: IndustryBenchmark;
}

export interface IndustryBenchmark {
  industry: Industry;
  sdeMultipleRange: [number, number];
  ebitdaMultipleRange: [number, number];
  revenueMultipleRange: [number, number];
  source: string;
}

export interface CashFlowResult {
  monthlyCashFlowAfterDebt: number;
  annualCashFlowAfterDebt: number;
  profitMargin: number;
}

export interface ReturnsResult {
  totalCashInvested: number;
  cashOnCashROI: number;
  paybackPeriodYears: number;
}

export interface DSCRResult {
  dscr: number | null;
  rating: "strong" | "acceptable" | "weak" | "critical" | "not-applicable";
  meetsIllustrativeThreshold: boolean | null;
}

export interface BreakEvenPoint {
  month: number;
  cumulativeCashFlow: number;
}

export interface AcquisitionScoreBreakdown {
  dscrScore: number;
  roiScore: number;
  paybackScore: number;
  growthScore: number;
  valuationScore: number;
  totalScore: number;
  rating: "excellent" | "good" | "fair" | "risky" | "poor";
}

/** The full output of running one business + financing + scenario through the engine. */
export interface AnalysisResult {
  id: string;
  createdAt: string;
  businessName: string;
  inputs: BusinessInputs;
  financing: FinancingInputs;
  valuation: ValuationEstimate;
  loan: LoanSummary;
  cashFlow: CashFlowResult;
  dscr: DSCRResult;
  returns: ReturnsResult;
  breakEvenSchedule: BreakEvenPoint[];
  score: AcquisitionScoreBreakdown;
}
