import type { Industry, IndustryBenchmark } from "@/types/business";

/**
 * Industry valuation multiple ranges.
 *
 * These retained ranges have no exact dated source in the repository. They
 * are legacy educational assumptions, not market evidence, comparables or
 * appraisals. A future update must cite the exact source, publication date,
 * covered period and relevant segment before calling a range sourced.
 */
export const INDUSTRY_BENCHMARKS: Record<Industry, IndustryBenchmark> = {
  retail: {
    industry: "retail",
    sdeMultipleRange: [1.5, 2.5],
    ebitdaMultipleRange: [3.0, 4.5],
    revenueMultipleRange: [0.3, 0.6],
    source: "Legacy educational assumption for retail; not verified market evidence.",
  },
  restaurant: {
    industry: "restaurant",
    sdeMultipleRange: [1.5, 2.2],
    ebitdaMultipleRange: [2.5, 4.0],
    revenueMultipleRange: [0.25, 0.45],
    source: "Legacy educational assumption for restaurants; not verified market evidence.",
  },
  service: {
    industry: "service",
    sdeMultipleRange: [2.0, 3.0],
    ebitdaMultipleRange: [3.5, 5.0],
    revenueMultipleRange: [0.4, 0.8],
    source: "Legacy educational assumption for service businesses; not verified market evidence.",
  },
  ecommerce: {
    industry: "ecommerce",
    sdeMultipleRange: [2.0, 3.5],
    ebitdaMultipleRange: [3.0, 5.0],
    revenueMultipleRange: [0.5, 1.2],
    source: "Legacy educational assumption for ecommerce; not verified market evidence.",
  },
  manufacturing: {
    industry: "manufacturing",
    sdeMultipleRange: [2.5, 4.0],
    ebitdaMultipleRange: [4.0, 6.0],
    revenueMultipleRange: [0.5, 1.0],
    source: "Legacy educational assumption for manufacturing; not verified market evidence.",
  },
  software: {
    industry: "software",
    sdeMultipleRange: [3.0, 5.0],
    ebitdaMultipleRange: [5.0, 8.0],
    revenueMultipleRange: [1.5, 4.0],
    source: "Legacy educational assumption for software; not verified market evidence.",
  },
  healthcare: {
    industry: "healthcare",
    sdeMultipleRange: [2.5, 4.0],
    ebitdaMultipleRange: [4.0, 6.5],
    revenueMultipleRange: [0.6, 1.2],
    source: "Legacy educational assumption for healthcare; not verified market evidence.",
  },
  construction: {
    industry: "construction",
    sdeMultipleRange: [2.0, 3.0],
    ebitdaMultipleRange: [3.5, 5.0],
    revenueMultipleRange: [0.35, 0.7],
    source: "Legacy educational assumption for construction; not verified market evidence.",
  },
  "professional-services": {
    industry: "professional-services",
    sdeMultipleRange: [2.0, 3.5],
    ebitdaMultipleRange: [3.5, 5.5],
    revenueMultipleRange: [0.5, 1.0],
    source: "Legacy educational assumption for professional services; not verified market evidence.",
  },
  other: {
    industry: "other",
    sdeMultipleRange: [2.0, 3.0],
    ebitdaMultipleRange: [3.0, 5.0],
    revenueMultipleRange: [0.4, 0.8],
    source: "Legacy educational assumption for other sectors; not verified market evidence.",
  },
};

export function getIndustryBenchmark(industry: Industry): IndustryBenchmark {
  return INDUSTRY_BENCHMARKS[industry];
}

/** Midpoint of a [low, high] multiple range — used as the default point estimate. */
export function midpoint(range: [number, number]): number {
  return (range[0] + range[1]) / 2;
}
