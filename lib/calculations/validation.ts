import type { BusinessInputs, FinancingInputs } from "@/types/business";
import { calculateFundingGap } from "@/lib/calculations/financing";

export interface InputIntegrityIssue {
  id: string;
  severity: "blocking" | "warning";
  field: string;
  title: string;
  explanation: string;
}

/** Checks whether inputs are structurally usable before interpreting outputs. */
export function validateDealInputs(
  business: BusinessInputs,
  financing: FinancingInputs
): InputIntegrityIssue[] {
  const issues: InputIntegrityIssue[] = [];
  const blockNonPositive = (field: string, label: string, value: number) => {
    if (!Number.isFinite(value) || value <= 0) issues.push({ id: `${field}-invalid`, severity: "blocking", field, title: `${label} is required`, explanation: `Enter a positive, finite ${label.toLowerCase()} before relying on the analysis.` });
  };

  blockNonPositive("purchasePrice", "Purchase price", business.purchasePrice);
  blockNonPositive("annualRevenue", "Annual revenue", business.annualRevenue);
  if (!Number.isFinite(business.sde) || business.sde < 0) issues.push({ id: "sde-invalid", severity: "blocking", field: "sde", title: "SDE cannot be negative", explanation: "Use zero for a break-even business or enter the reported positive SDE." });
  if (business.sde > business.annualRevenue && business.annualRevenue > 0) issues.push({ id: "sde-above-revenue", severity: "warning", field: "sde", title: "SDE exceeds revenue", explanation: "This relationship is unusual. Verify seller add-backs and confirm that revenue and SDE cover the same period." });
  if (business.ebitda > business.annualRevenue && business.annualRevenue > 0) issues.push({ id: "ebitda-above-revenue", severity: "warning", field: "ebitda", title: "EBITDA exceeds revenue", explanation: "Confirm the EBITDA figure and reporting period before using the valuation cross-check." });
  if (business.ebitda > business.sde && business.sde >= 0) issues.push({ id: "ebitda-above-sde", severity: "warning", field: "ebitda", title: "EBITDA exceeds SDE", explanation: "For many owner-operated businesses SDE is at least as high as EBITDA. Reconcile owner compensation and add-backs." });

  if (financing.loanAmount > 0 && (!Number.isFinite(financing.loanTermYears) || financing.loanTermYears <= 0)) issues.push({ id: "loan-term-invalid", severity: "blocking", field: "loanTermYears", title: "Loan term is required", explanation: "A financed purchase needs a positive repayment term." });
  if (!Number.isFinite(financing.interestRate) || financing.interestRate < 0) issues.push({ id: "interest-rate-invalid", severity: "blocking", field: "interestRate", title: "Interest rate is invalid", explanation: "Enter a non-negative annual interest rate." });
  const gap = calculateFundingGap(business.purchasePrice, financing);
  if (Math.abs(gap) >= 1) issues.push({ id: "funding-mismatch", severity: "warning", field: "financing", title: gap > 0 ? "Capital stack has a funding gap" : "Capital stack exceeds the purchase price", explanation: gap > 0 ? "Down payment, bank debt, and seller financing do not fully fund the stated purchase price." : "Review the proposed sources of funds so they do not exceed the stated purchase price." });
  return issues;
}

export function summarizeInputIntegrity(issues: InputIntegrityIssue[]) {
  const blocking = issues.filter((issue) => issue.severity === "blocking").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  return { blocking, warnings, isDecisionReady: blocking === 0, label: blocking > 0 ? `${blocking} blocking input ${blocking === 1 ? "issue" : "issues"}` : warnings > 0 ? `${warnings} item${warnings === 1 ? "" : "s"} to review` : "Inputs pass structural checks" };
}
