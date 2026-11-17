import type { AnalysisResult } from "@/types/business";

export type InsightSeverity = "positive" | "review" | "critical";
export interface DealInsight { id: string; severity: InsightSeverity; title: string; explanation: string; nextStep: string; }

/** Converts model outputs into transparent, deterministic diligence priorities. */
export function generateDealInsights(analysis: AnalysisResult): DealInsight[] {
  const insights: DealInsight[] = [];
  const pricePremium = analysis.valuation.blendedEstimate > 0
    ? analysis.inputs.purchasePrice / analysis.valuation.blendedEstimate - 1
    : 0;
  const sdeMargin = analysis.inputs.annualRevenue > 0 ? analysis.inputs.sde / analysis.inputs.annualRevenue : 0;

  if (analysis.dscr.dscr < 1) insights.push({ id: "dscr-critical", severity: "critical", title: "Debt service is not covered", explanation: "Modeled earnings do not fully cover scheduled annual debt payments.", nextStep: "Reduce debt, increase equity, renegotiate price, or verify add-backs before advancing." });
  else if (analysis.dscr.dscr < 1.25) insights.push({ id: "dscr-review", severity: "review", title: "Debt coverage has limited cushion", explanation: "The structure covers debt but falls below a common 1.25x screening threshold.", nextStep: "Stress-test earnings and ask lenders how they treat seller add-backs and owner compensation." });
  else insights.push({ id: "dscr-positive", severity: "positive", title: "Debt coverage clears the model threshold", explanation: "Modeled SDE provides at least $1.25 for each $1.00 of annual debt service.", nextStep: "Verify that tax returns and bank statements support the reported earnings." });

  if (pricePremium > .1) insights.push({ id: "valuation-premium", severity: pricePremium > .25 ? "critical" : "review", title: "Asking price exceeds modeled value", explanation: "The purchase price carries a meaningful premium to the blended industry estimate.", nextStep: "Require evidence for the premium, such as recurring revenue, low concentration, contracts, or defensible growth." });
  else insights.push({ id: "valuation-aligned", severity: "positive", title: "Price is near the modeled range", explanation: "The asking price is no more than 10% above the blended benchmark estimate.", nextStep: "Validate inventory, working capital, and excluded assets before treating the price as final." });

  if (sdeMargin < .1) insights.push({ id: "thin-margin", severity: "review", title: "Earnings margin is thin", explanation: "SDE is below 10% of annual revenue, leaving less room for operating volatility.", nextStep: "Review monthly profit-and-loss statements and identify fixed versus variable expenses." });
  if (analysis.inputs.growthRate > .2) insights.push({ id: "growth-proof", severity: "review", title: "Growth assumption needs strong evidence", explanation: "A growth rate above 20% can materially improve the model and should not be accepted without support.", nextStep: "Request monthly revenue history, pipeline evidence, churn data, and customer-cohort performance." });
  if (analysis.returns.paybackPeriodYears > 7 || !Number.isFinite(analysis.returns.paybackPeriodYears)) insights.push({ id: "slow-payback", severity: "critical", title: "Buyer capital recovers slowly", explanation: "The current cash-flow model takes more than seven years to repay the initial cash invested.", nextStep: "Rework price and financing or require a stronger operational improvement thesis." });

  return insights;
}
