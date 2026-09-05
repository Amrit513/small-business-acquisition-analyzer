import { describe, expect, it } from "vitest";
import { buildEvidenceReport } from "@/lib/reporting/evidence";

describe("buildEvidenceReport", () => {
  it("uses conservative defaults when evidence is absent", () => {
    const rows = buildEvidenceReport();
    expect(rows).toHaveLength(6);
    expect(rows.find((row) => row.field === "purchasePrice")?.sourceLabel).toBe("Marketplace listing");
    expect(rows.find((row) => row.field === "annualRevenue")?.sourceLabel).toBe("Unverified assumption");
    expect(rows.every((row) => row.needsVerification)).toBe(true);
  });

  it("marks only document-supported claims as verified", () => {
    const rows = buildEvidenceReport({ annualRevenue: "document-supported", sde: "seller-provided" });
    expect(rows.find((row) => row.field === "annualRevenue")?.needsVerification).toBe(false);
    expect(rows.find((row) => row.field === "sde")?.needsVerification).toBe(true);
  });
});
