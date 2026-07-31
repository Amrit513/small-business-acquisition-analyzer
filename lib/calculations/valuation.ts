import type { BusinessInputs, ValuationEstimate } from "@/types/business";
import { getIndustryBenchmark, midpoint } from "@/lib/benchmarks/industryMultiples";

/**
 * Estimates business value using three standard small-business valuation
 * methods, then blends them into a single point estimate.
 *
 * Why three methods instead of one:
 * - SDE method is the industry-standard approach for businesses where the
 *   owner is the primary source of profit (most Main Street businesses).
 * - EBITDA method is more appropriate for larger businesses with a
 *   management layer already in place.
 * - Revenue method is a rough sanity check — useful when margins are
 *   unclear or as a cross-check against the other two.
 *
 * None of these three numbers is "the" valuation. Showing all three (and
 * their spread) is more honest than pretending a single number is precise.
 */
export function estimateValuation(inputs: BusinessInputs): ValuationEstimate {
  const benchmark = getIndustryBenchmark(inputs.industry);

  const sdeMultiple = midpoint(benchmark.sdeMultipleRange);
  const ebitdaMultiple = midpoint(benchmark.ebitdaMultipleRange);
  const revenueMultiple = midpoint(benchmark.revenueMultipleRange);

  const sdeMethod = inputs.sde * sdeMultiple;
  const ebitdaMethod = inputs.ebitda * ebitdaMultiple;
  const revenueMethod = inputs.annualRevenue * revenueMultiple;

  // Blend: weight SDE most heavily for small businesses, since it's the
  // most commonly used method in actual Main Street transactions.
  const blendedEstimate = sdeMethod * 0.5 + ebitdaMethod * 0.3 + revenueMethod * 0.2;

  const impliedRevenueMultiple =
    inputs.annualRevenue > 0 ? inputs.purchasePrice / inputs.annualRevenue : 0;

  return {
    sdeMethod: roundToCents(sdeMethod),
    ebitdaMethod: roundToCents(ebitdaMethod),
    revenueMethod: roundToCents(revenueMethod),
    blendedEstimate: roundToCents(blendedEstimate),
    impliedRevenueMultiple: roundToHundredths(impliedRevenueMultiple),
    industryBenchmark: benchmark,
  };
}

/** Simple profit margin: SDE as a percentage of annual revenue. */
export function calculateProfitMargin(inputs: BusinessInputs): number {
  if (inputs.annualRevenue === 0) return 0;
  return roundToHundredths(inputs.sde / inputs.annualRevenue);
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundToHundredths(value: number): number {
  return Math.round(value * 10000) / 10000;
}
