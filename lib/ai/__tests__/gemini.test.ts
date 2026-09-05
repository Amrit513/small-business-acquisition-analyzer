import { describe, expect, it } from "vitest";
import { buildGeminiRequest, extractGeminiText, GEMINI_MODEL } from "@/lib/ai/gemini";
import { defaultEvidence } from "@/lib/evidence/provenance";
import { runAnalysis } from "@/lib/calculations";

const analysis = runAnalysis("Atlas Home Services", { purchasePrice: 425000, annualRevenue: 520000, sde: 170000, ebitda: 125000, growthRate: .07, industry: "service", numberOfEmployees: 6, currentExpenses: 350000, ownerSalary: 80000 }, { downPayment: 85000, loanAmount: 340000, interestRate: .095, loanTermYears: 10, closingCosts: 18000 });

describe("Gemini underwriting transport", () => {
  it("uses the free-tier model with structured JSON output", () => {
    const request = buildGeminiRequest(analysis, defaultEvidence);
    expect(GEMINI_MODEL).toBe("gemini-2.5-flash-lite");
    expect(request.generationConfig.responseMimeType).toBe("application/json");
    expect(request.generationConfig.responseSchema.required).toContain("verdict");
    expect(request.contents[0].parts[0].text).toContain("<DATA>");
    expect(JSON.stringify(request)).not.toContain("amortizationSchedule");
  });

  it("joins multi-part structured responses", () => {
    expect(extractGeminiText({ candidates: [{ content: { parts: [{ text: '{"verdict":' }, { text: '"pause"}' }] } }] })).toBe('{"verdict":"pause"}');
  });

  it("returns null for blocked or empty responses", () => {
    expect(extractGeminiText({ candidates: [{ finishReason: "SAFETY" }] })).toBeNull();
    expect(extractGeminiText({ candidates: [{ content: { parts: [{ text: "   " }] } }] })).toBeNull();
  });
});
