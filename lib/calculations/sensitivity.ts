import type { BusinessInputs, FinancingInputs } from "@/types/business";
import { calculateCashFlow } from "@/lib/calculations/returns";
import { calculateDSCR, summarizeLoan } from "@/lib/calculations/financing";

export interface SensitivityCell {
  earningsChange: number;
  interestRateChange: number;
  dscr: number | null;
  annualCashFlowAfterDebt: number;
  meetsIllustrativeThreshold: boolean | null;
}

/**
 * Re-underwrites a deal across earnings and rate shocks. The function changes
 * only the stated assumptions, leaving the original analysis untouched.
 */
export function buildSensitivityMatrix(
  inputs: BusinessInputs,
  financing: FinancingInputs,
  earningsChanges: number[] = [-0.2, -0.1, 0, 0.1],
  interestRateChanges: number[] = [0, 0.01, 0.02]
): SensitivityCell[][] {
  return earningsChanges.map((earningsChange) =>
    interestRateChanges.map((interestRateChange) => {
      const stressedInputs: BusinessInputs = {
        ...inputs,
        sde: Math.max(0, inputs.sde * (1 + earningsChange)),
      };
      const stressedFinancing: FinancingInputs = {
        ...financing,
        interestRate: Math.max(0, financing.interestRate + interestRateChange),
      };
      const loan = summarizeLoan(stressedFinancing);
      const dscr = calculateDSCR(stressedInputs, loan);
      const cashFlow = calculateCashFlow(stressedInputs, loan);

      return {
        earningsChange,
        interestRateChange,
        dscr: dscr.dscr,
        annualCashFlowAfterDebt: cashFlow.annualCashFlowAfterDebt,
        meetsIllustrativeThreshold: dscr.meetsIllustrativeThreshold,
      };
    })
  );
}
