import type { Industry, IndustryBenchmark } from "@/types/business";

/**
 * Industry valuation multiple ranges.
 *
 * These ranges are directional approximations based on commonly cited
 * small-business M&A market data (e.g. BizBuySell Insight Reports, IBBA
 * Market Pulse surveys) as of recent years. Actual multiples vary widely
 * based on business quality, growth, customer concentration, and location.
 *
 * IMPORTANT: These are educational defaults, not appraisals. Contributors
 * are encouraged to refine these with cited, sourced data — see
 * docs/FORMULAS.md for how these are used and CONTRIBUTING.md for how to
 * propose updates.
 */
export const INDUSTRY_BENCHMARKS: Record<Industry, IndustryBenchmark> = {
  retail: {
    industry: "retail",
    sdeMultipleRange: [1.5, 2.5],
    ebitdaMultipleRange: [3.0, 4.5],
    revenueMultipleRange: [0.3, 0.6],
    source: "BizBuySell Insight Report (general retail small-business comps)",
  },
  restaurant: {
    industry: "restaurant",
    sdeMultipleRange: [1.5, 2.2],
    ebitdaMultipleRange: [2.5, 4.0],
    revenueMultipleRange: [0.25, 0.45],
    source: "BizBuySell Insight Report (food service comps)",
  },
  service: {
    industry: "service",
    sdeMultipleRange: [2.0, 3.0],
    ebitdaMultipleRange: [3.5, 5.0],
    revenueMultipleRange: [0.4, 0.8],
    source: "IBBA Market Pulse Survey (Main Street service businesses)",
  },
  ecommerce: {
    industry: "ecommerce",
    sdeMultipleRange: [2.0, 3.5],
    ebitdaMultipleRange: [3.0, 5.0],
    revenueMultipleRange: [0.5, 1.2],
    source: "Empire Flippers / FE International marketplace comps",
  },
  manufacturing: {
    industry: "manufacturing",
    sdeMultipleRange: [2.5, 4.0],
    ebitdaMultipleRange: [4.0, 6.0],
    revenueMultipleRange: [0.5, 1.0],
    source: "IBBA Market Pulse Survey (manufacturing segment)",
  },
  software: {
    industry: "software",
    sdeMultipleRange: [3.0, 5.0],
    ebitdaMultipleRange: [5.0, 8.0],
    revenueMultipleRange: [1.5, 4.0],
    source: "SaaS Capital / Empire Flippers small-SaaS comps",
  },
  healthcare: {
    industry: "healthcare",
    sdeMultipleRange: [2.5, 4.0],
    ebitdaMultipleRange: [4.0, 6.5],
    revenueMultipleRange: [0.6, 1.2],
    source: "IBBA Market Pulse Survey (healthcare/medical services)",
  },
  construction: {
    industry: "construction",
    sdeMultipleRange: [2.0, 3.0],
    ebitdaMultipleRange: [3.5, 5.0],
    revenueMultipleRange: [0.35, 0.7],
    source: "IBBA Market Pulse Survey (construction/trades)",
  },
  "professional-services": {
    industry: "professional-services",
    sdeMultipleRange: [2.0, 3.5],
    ebitdaMultipleRange: [3.5, 5.5],
    revenueMultipleRange: [0.5, 1.0],
    source: "IBBA Market Pulse Survey (professional services)",
  },
  other: {
    industry: "other",
    sdeMultipleRange: [2.0, 3.0],
    ebitdaMultipleRange: [3.0, 5.0],
    revenueMultipleRange: [0.4, 0.8],
    source: "Blended Main Street average across all sectors (BizBuySell / IBBA)",
  },
};

export function getIndustryBenchmark(industry: Industry): IndustryBenchmark {
  return INDUSTRY_BENCHMARKS[industry];
}

/** Midpoint of a [low, high] multiple range — used as the default point estimate. */
export function midpoint(range: [number, number]): number {
  return (range[0] + range[1]) / 2;
}
