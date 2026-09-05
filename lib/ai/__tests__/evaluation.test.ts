import { describe, expect, it } from "vitest";
import { buildUnderwritingRubric, evaluateUnderwritingReview } from "@/lib/ai/evaluation";
import type { AIReview } from "@/lib/ai/underwriting";
import { runAnalysis } from "@/lib/calculations";
import type { BusinessInputs, FinancingInputs } from "@/types/business";

const business: BusinessInputs = { purchasePrice: 425000, annualRevenue: 520000, sde: 170000, ebitda: 125000, growthRate: .07, industry: "service", numberOfEmployees: 6, currentExpenses: 350000, ownerSalary: 80000 };
const financing: FinancingInputs = { downPayment: 85000, loanAmount: 340000, interestRate: .095, loanTermYears: 10, closingCosts: 18000 };
const cautiousReview: AIReview = {
  verdict: "advance_with_conditions",
  confidence: "medium",
  executiveSummary: "The modeled economics support deeper diligence with conditions.",
  strengths: ["Base coverage is positive."],
  risks: [{ title: "Downside coverage", evidence: "The stress case DSCR is 1.18x.", impact: "A decline in earnings reduces debt cushion." }],
  missingData: ["Tax returns", "Bank statements", "Customer concentration"],
  diligenceQuestions: ["Do bank deposits reconcile to reported revenue?"],
  negotiationStrategy: ["Condition terms on verified earnings."],
  caveats: ["All inputs are modeled and unverified."],
};

describe("AI underwriting regression grading", () => {
  it("derives stricter verdicts when the base case cannot cover debt", () => {
    const weak = runAnalysis("Weak Deal", { ...business, sde: 40000 }, financing);
    expect(buildUnderwritingRubric(weak).allowedVerdicts).toEqual(["pause", "decline"]);
  });

  it("passes a cautious, evidence-aware review", () => {
    const analysis = runAnalysis("Atlas", business, financing);
    const rubric = { ...buildUnderwritingRubric(analysis), allowedVerdicts: ["advance_with_conditions"] as AIReview["verdict"][] };
    const result = evaluateUnderwritingReview(cautiousReview, rubric);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });

  it("catches optimistic verdicts, unsupported confidence, and vague evidence", () => {
    const weak = runAnalysis("Weak Deal", { ...business, sde: 40000 }, financing);
    const unsafe: AIReview = { ...cautiousReview, verdict: "advance", confidence: "high", risks: [{ title: "Risk", evidence: "The deal may struggle.", impact: "Returns could fall." }], missingData: [], caveats: ["Results may vary."] };
    const result = evaluateUnderwritingReview(unsafe, buildUnderwritingRubric(weak));
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.checks.filter((check) => !check.passed).map((check) => check.id)).toEqual(["verdict", "confidence", "missing-data", "risk-evidence", "evidence-caveat"]);
  });
});
