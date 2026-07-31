import type {
  AcquisitionScoreBreakdown,
  BusinessInputs,
  DSCRResult,
  ReturnsResult,
  ValuationEstimate,
} from "@/types/business";

/**
 * Acquisition Score: a weighted 0-100 composite that answers "how good is
 * this deal, all things considered?"
 *
 * Weights (documented here AND in docs/FORMULAS.md — keep both in sync):
 *   DSCR                          30%  — can this deal even get financed / survive its own debt
 *   Cash-on-cash ROI              25%  — is the return competitive with alternatives
 *   Payback period                20%  — faster payback = lower risk
 *   Revenue/margin quality        15%  — growth rate + profit margin of the underlying business
 *   Valuation vs. industry norms  10%  — is the buyer overpaying relative to comps
 *
 * Every sub-score is computed by a small, independently testable function
 * so the total is fully auditable — this is intentionally NOT a black box.
 */

export function scoreDSCR(dscrResult: DSCRResult): number {
  const { dscr } = dscrResult;
  if (dscr >= 1.5) return 100;
  if (dscr >= 1.25) return 85;
  if (dscr >= 1.0) return 60;
  if (dscr >= 0.8) return 30;
  return 0;
}

export function scoreROI(cashOnCashROI: number): number {
  // Benchmarked loosely against public-market long-run averages (~8-10%)
  // and typical small-business buyer return expectations (20%+).
  if (cashOnCashROI >= 0.35) return 100;
  if (cashOnCashROI >= 0.25) return 85;
  if (cashOnCashROI >= 0.15) return 65;
  if (cashOnCashROI >= 0.08) return 40;
  if (cashOnCashROI > 0) return 20;
  return 0;
}

export function scorePaybackPeriod(paybackPeriodYears: number): number {
  if (!isFinite(paybackPeriodYears)) return 0;
  if (paybackPeriodYears <= 3) return 100;
  if (paybackPeriodYears <= 4) return 85;
  if (paybackPeriodYears <= 5) return 65;
  if (paybackPeriodYears <= 7) return 40;
  return 15;
}

export function scoreGrowthAndMargin(inputs: BusinessInputs): number {
  const margin = inputs.annualRevenue > 0 ? inputs.sde / inputs.annualRevenue : 0;
  const growth = inputs.growthRate;

  // Blend margin quality (0-15%+ considered strong for Main Street) and
  // growth rate into one 0-100 sub-score.
  const marginScore = Math.min((margin / 0.2) * 100, 100); // 20%+ margin = full marks
  const growthScore = Math.min((growth / 0.1) * 100, 100); // 10%+ growth = full marks

  return Math.round(marginScore * 0.6 + growthScore * 0.4);
}

export function scoreValuation(
  inputs: BusinessInputs,
  valuation: ValuationEstimate
): number {
  // Compare purchase price to the blended estimate. Paying at or below the
  // blended estimate scores well; significantly overpaying scores poorly.
  if (valuation.blendedEstimate <= 0) return 50; // insufficient data, neutral score

  const priceToValueRatio = inputs.purchasePrice / valuation.blendedEstimate;

  if (priceToValueRatio <= 0.9) return 100;
  if (priceToValueRatio <= 1.0) return 85;
  if (priceToValueRatio <= 1.1) return 60;
  if (priceToValueRatio <= 1.25) return 35;
  return 10;
}

export function calculateAcquisitionScore(
  inputs: BusinessInputs,
  valuation: ValuationEstimate,
  dscrResult: DSCRResult,
  returns: ReturnsResult
): AcquisitionScoreBreakdown {
  const dscrScore = scoreDSCR(dscrResult);
  const roiScore = scoreROI(returns.cashOnCashROI);
  const paybackScore = scorePaybackPeriod(returns.paybackPeriodYears);
  const growthScore = scoreGrowthAndMargin(inputs);
  const valuationScore = scoreValuation(inputs, valuation);

  const totalScore = Math.round(
    dscrScore * 0.3 +
      roiScore * 0.25 +
      paybackScore * 0.2 +
      growthScore * 0.15 +
      valuationScore * 0.1
  );

  let rating: AcquisitionScoreBreakdown["rating"];
  if (totalScore >= 85) rating = "excellent";
  else if (totalScore >= 70) rating = "good";
  else if (totalScore >= 50) rating = "fair";
  else if (totalScore >= 30) rating = "risky";
  else rating = "poor";

  return {
    dscrScore,
    roiScore,
    paybackScore,
    growthScore,
    valuationScore,
    totalScore,
    rating,
  };
}
