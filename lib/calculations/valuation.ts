import type { BusinessInputs, ValuationEstimate } from "@/types/business";
import { getIndustryBenchmark, midpoint } from "@/lib/benchmarks/industryMultiples";
import {roundDecimal,roundToCents} from "./precision";

export {roundToCents} from "./precision";

/**
 * Applies three retained educational multiple assumptions, then blends them
 * into a legacy point illustration.
 *
 * Why three methods instead of one:
 * - SDE illustrates owner-operated earnings.
 * - EBITDA illustrates earnings before owner add-backs.
 * - Revenue illustrates a top-line cross-check.
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

  // Retained educational weighting; not a sourced market convention.
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

export function roundToHundredths(value: number): number {
  return roundDecimal(value,4);
}
