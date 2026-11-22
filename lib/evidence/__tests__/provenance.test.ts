import { describe, expect, it } from "vitest";
import { defaultEvidence, normalizeEvidence, summarizeEvidence } from "@/lib/evidence/provenance";

describe("financial evidence provenance", () => {
  it("fills missing fields with conservative defaults", () => {
    const evidence = normalizeEvidence({ annualRevenue: "document-supported" });
    expect(evidence.annualRevenue).toBe("document-supported");
    expect(evidence.sde).toBe("unverified");
    expect(evidence.purchasePrice).toBe("unverified");
  });

  it("summarizes document support without claiming verification", () => {
    const summary = summarizeEvidence({ ...defaultEvidence, annualRevenue: "document-supported", sde: "document-supported" });
    expect(summary.documentSupported).toBe(2);
    expect(summary.label).toBe("2/6 key fields document-supported");
  });
});
