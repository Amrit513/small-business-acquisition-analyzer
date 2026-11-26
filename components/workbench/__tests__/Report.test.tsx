import React from "react";
import { pdf } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { calculate } from "@/lib/calculations/workbench";
import { MAX_DEAL_NAME_LENGTH, sampleDeal } from "@/lib/workspace/deal";
import { Report, registerReportFont } from "../Report";

describe("investment memo PDF", () => {
  it("renders the complete fictional sample with the distributed fonts", async () => {
    const deal = sampleDeal();
    registerReportFont(`${process.cwd()}/public/fonts`);

    const blob = await pdf(
      <Report deal={deal} result={calculate(deal)} generated="2026-11-23" />,
    ).toBlob();
    const bytes = Buffer.from(await blob.arrayBuffer());

    expect(blob.type).toBe("application/pdf");
    expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(10_000);
  }, 15_000);

  it("renders the longest supported deal name without discarding it", async () => {
    const deal = sampleDeal();
    deal.name = "A".repeat(MAX_DEAL_NAME_LENGTH);
    registerReportFont(`${process.cwd()}/public/fonts`);

    const blob = await pdf(
      <Report deal={deal} result={calculate(deal)} generated="2026-11-26" />,
    ).toBlob();
    const bytes = Buffer.from(await blob.arrayBuffer());

    expect(blob.type).toBe("application/pdf");
    expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(10_000);
  }, 15_000);
});
