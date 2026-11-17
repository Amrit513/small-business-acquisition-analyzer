import { describe, expect, it } from "vitest";
import { buildEvidenceReport } from "@/lib/reporting/evidence";
import { evidenceMetadata } from "@/lib/reporting/provenance";

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

  it("uses the same explicit provenance gaps in screen and PDF reporting", () => {
    expect(evidenceMetadata({ location: "  Listing page  ", period: "", date: "" })).toEqual({
      location: "Listing page", period: "Period not recorded", date: "Date not recorded",
    });
  });
});
