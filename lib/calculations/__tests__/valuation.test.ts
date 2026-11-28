import { describe, expect, it } from "vitest";
import { estimateValuation, calculateProfitMargin } from "@/lib/calculations/valuation";
import { INDUSTRY_BENCHMARKS } from "@/lib/benchmarks/industryMultiples";
import type { BusinessInputs } from "@/types/business";

const baseInputs: BusinessInputs = {
  purchasePrice: 450000,
  annualRevenue: 800000,
  sde: 180000,
  ebitda: 150000,
  growthRate: 0.05,
  industry: "service",
  numberOfEmployees: 6,
  currentExpenses: 620000,
  ownerSalary: 70000,
};

describe("estimateValuation", () => {
  it("computes all three valuation methods as positive numbers", () => {
    const result = estimateValuation(baseInputs);
    expect(result.sdeMethod).toBeGreaterThan(0);
    expect(result.ebitdaMethod).toBeGreaterThan(0);
    expect(result.revenueMethod).toBeGreaterThan(0);
  });

  it("blends the three methods using the documented 50/30/20 weighting", () => {
    const result = estimateValuation(baseInputs);
    const expectedBlend =
      result.sdeMethod * 0.5 + result.ebitdaMethod * 0.3 + result.revenueMethod * 0.2;
    expect(result.blendedEstimate).toBeCloseTo(expectedBlend, 2);
  });

  it("computes implied revenue multiple from purchase price / revenue", () => {
    const result = estimateValuation(baseInputs);
    expect(result.impliedRevenueMultiple).toBeCloseTo(450000 / 800000, 4);
  });

  it("returns 0 implied multiple when revenue is 0 (no divide-by-zero)", () => {
    const result = estimateValuation({ ...baseInputs, annualRevenue: 0 });
    expect(result.impliedRevenueMultiple).toBe(0);
  });

  it("attaches the correct industry benchmark", () => {
    const result = estimateValuation(baseInputs);
    expect(result.industryBenchmark.industry).toBe("service");
  });

  it("labels every undated legacy range as an educational assumption", () => {
    for (const benchmark of Object.values(INDUSTRY_BENCHMARKS)) {
      expect(benchmark.source).toContain("Legacy educational assumption");
      expect(benchmark.source).toContain("not verified market evidence");
      expect(benchmark.source).not.toMatch(/BizBuySell|IBBA|Empire Flippers|FE International|SaaS Capital/);
    }
  });
});

describe("calculateProfitMargin", () => {
  it("computes SDE / revenue", () => {
    expect(calculateProfitMargin(baseInputs)).toBeCloseTo(180000 / 800000, 4);
  });

  it("returns 0 when revenue is 0", () => {
    expect(calculateProfitMargin({ ...baseInputs, annualRevenue: 0 })).toBe(0);
  });
});
