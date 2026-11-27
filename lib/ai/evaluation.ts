import type { AnalysisResult } from "@/types/business";
import { buildSensitivityMatrix } from "@/lib/calculations/sensitivity";
import type { AIReview } from "@/lib/ai/underwriting";

export interface UnderwritingRubric {
  allowedVerdicts: AIReview["verdict"][];
  maxConfidence: AIReview["confidence"];
  minimumMissingDataItems: number;
  requireEvidenceBackedRisk: boolean;
  rationale: string;
}

export interface EvaluationCheck {
  id: "verdict" | "confidence" | "missing-data" | "risk-evidence" | "evidence-caveat";
  passed: boolean;
  detail: string;
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  checks: EvaluationCheck[];
}

/** Builds scenario-specific expectations from deterministic engine outputs. */
export function buildUnderwritingRubric(analysis: AnalysisResult): UnderwritingRubric {
  const matrix = buildSensitivityMatrix(analysis.inputs, analysis.financing);
  const downside = matrix[0]?.[2];
  const baseCoverageFails = analysis.dscr.dscr === null || analysis.dscr.dscr < 1;
  const downsideFails = !downside || downside.dscr === null || downside.dscr < 1 || downside.annualCashFlowAfterDebt < 0;
  const downsideIsThin = !downsideFails && downside.dscr !== null && downside.dscr < 1.25;

  if (baseCoverageFails || downsideFails) {
    return {
      allowedVerdicts: ["pause", "decline"],
      maxConfidence: "medium",
      minimumMissingDataItems: 3,
      requireEvidenceBackedRisk: true,
      rationale: baseCoverageFails
        ? "Base-case debt service is not fully covered."
        : "The severe downside case loses full debt coverage or produces negative cash flow.",
    };
  }

  return {
    allowedVerdicts: downsideIsThin
      ? ["advance_with_conditions", "pause"]
      : ["advance", "advance_with_conditions"],
    maxConfidence: "medium",
    minimumMissingDataItems: 3,
    requireEvidenceBackedRisk: true,
    rationale: downsideIsThin
      ? "The downside case remains solvent but misses the 1.25x screening threshold."
      : "Base and downside cases retain at least 1.25x modeled coverage.",
  };
}

/**
 * Deterministically grades a captured model response. This never calls a model
 * and is safe to run in CI against saved evaluation outputs.
 */
export function evaluateUnderwritingReview(
  review: AIReview,
  rubric: UnderwritingRubric
): EvaluationResult {
  const confidenceRank: Record<AIReview["confidence"], number> = { low: 0, medium: 1, high: 2 };
  const evidenceTerms = /\b(unverified|not provided|source document|tax return|bank statement|seller[- ]provided|modeled)\b/i;
  const numericEvidence = /(?:\$|%|\b\d+(?:\.\d+)?x?\b|not provided)/i;

  const checks: EvaluationCheck[] = [
    {
      id: "verdict",
      passed: rubric.allowedVerdicts.includes(review.verdict),
      detail: `Expected ${rubric.allowedVerdicts.join(" or ")}; received ${review.verdict}.`,
    },
    {
      id: "confidence",
      passed: confidenceRank[review.confidence] <= confidenceRank[rubric.maxConfidence],
      detail: `Maximum supported confidence is ${rubric.maxConfidence}; received ${review.confidence}.`,
    },
    {
      id: "missing-data",
      passed: review.missingData.length >= rubric.minimumMissingDataItems,
      detail: `Expected at least ${rubric.minimumMissingDataItems} missing-evidence items; received ${review.missingData.length}.`,
    },
    {
      id: "risk-evidence",
      passed: !rubric.requireEvidenceBackedRisk || (review.risks.length > 0 && review.risks.every((risk) => numericEvidence.test(risk.evidence))),
      detail: "Each material risk must cite a numeric packet value or explicitly state that evidence was not provided.",
    },
    {
      id: "evidence-caveat",
      passed: review.caveats.some((caveat) => evidenceTerms.test(caveat)),
      detail: "At least one caveat must state that inputs are modeled, unverified, seller-provided, or unsupported by documents.",
    },
  ];
  const score = Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);
  return { passed: checks.every((check) => check.passed), score, checks };
}
