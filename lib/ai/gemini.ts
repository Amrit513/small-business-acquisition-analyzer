import type { AnalysisResult } from "@/types/business";
import type { EvidenceMap } from "@/lib/evidence/provenance";
import { buildUnderwritingUserPrompt, UNDERWRITING_SYSTEM_PROMPT, underwritingResponseSchema } from "@/lib/ai/underwriting";

export const GEMINI_MODEL = "gemini-2.5-flash-lite";

export function buildGeminiRequest(analysis: AnalysisResult, evidence: EvidenceMap) {
  return {
    systemInstruction: { parts: [{ text: UNDERWRITING_SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: buildUnderwritingUserPrompt(analysis, evidence) }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2200,
      responseMimeType: "application/json",
      responseSchema: underwritingResponseSchema,
    },
  } as const;
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
}

export function extractGeminiText(response: GeminiResponse): string | null {
  const text = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  return text || null;
}
