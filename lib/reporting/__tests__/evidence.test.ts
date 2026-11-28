import { describe, expect, it } from "vitest";
import { buildEvidenceReport } from "@/lib/reporting/evidence";
import { evidenceMetadata, evidenceStatusLabel } from "@/lib/reporting/provenance";
import { statuses } from "@/lib/workspace/deal";

describe("buildEvidenceReport", () => {
  it("uses conservative defaults when evidence is absent", () => {
    const rows = buildEvidenceReport();
    expect(rows).toHaveLength(6);
    expect(rows.find((row) => row.field === "purchasePrice")?.sourceLabel).toBe("Unverified assumption");
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

  it.each(statuses)("qualifies the %s label as user-selected and unauthenticated", status => {
    expect(evidenceStatusLabel(status)).toBe(`User-selected status: ${status} · source not authenticated`);
  });
});
