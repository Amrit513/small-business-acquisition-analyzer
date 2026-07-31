import type { AnalysisResult, BusinessInputs, FinancingInputs } from "@/types/business";
import { estimateValuation } from "@/lib/calculations/valuation";
import { summarizeLoan, calculateDSCR } from "@/lib/calculations/financing";
import {
  calculateCashFlow,
  calculateReturns,
  calculateBreakEvenSchedule,
} from "@/lib/calculations/returns";
import { calculateAcquisitionScore } from "@/lib/calculations/scoring";

/**
 * The single entry point for running a complete acquisition analysis.
 *
 * This function is the one place that wires every calculation module
 * together. UI code should call this rather than importing individual
 * calculation functions directly — it guarantees every AnalysisResult is
 * built the same way, in the same order, with nothing skipped.
 */
export function runAnalysis(
  businessName: string,
  inputs: BusinessInputs,
  financing: FinancingInputs
): AnalysisResult {
  const valuation = estimateValuation(inputs);
  const loan = summarizeLoan(financing);
  const cashFlow = calculateCashFlow(inputs, loan);
  const dscr = calculateDSCR(inputs, loan);
  const returns = calculateReturns(financing, cashFlow);
  const breakEvenSchedule = calculateBreakEvenSchedule(financing, cashFlow);
  const score = calculateAcquisitionScore(inputs, valuation, dscr, returns);

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    businessName,
    inputs,
    financing,
    valuation,
    loan,
    cashFlow,
    dscr,
    returns,
    breakEvenSchedule,
    score,
  };
}

function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export * from "@/lib/calculations/valuation";
export * from "@/lib/calculations/financing";
export * from "@/lib/calculations/returns";
export * from "@/lib/calculations/scenarios";
export * from "@/lib/calculations/scoring";
