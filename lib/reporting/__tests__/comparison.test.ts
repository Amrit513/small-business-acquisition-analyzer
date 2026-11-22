import {describe,expect,it} from "vitest";
import {buildComparisonRows} from "@/lib/reporting/comparison";
import {blankDeal,sampleDeal} from "@/lib/workspace/deal";

describe("comparison reporting",()=>{
 it("shows readiness and the assumptions that explain headline differences",()=>{
  const incomplete=blankDeal("draft","2026-11-17T00:00:00.000Z");
  const rows=buildComparisonRows([sampleDeal(),incomplete]);
  const row=(label:string)=>rows.find(item=>item.label===label)?.values;
  expect(row("Model status")?.[0]).toBe("Complete model screen");
  expect(row("Model status")?.[1]).toMatch(/^Incomplete model screen · \d+ unresolved issues$/);
  expect(row("Bank note · rate · term")?.[0]).toBe("$340,000 · 9.5% annual · 10 years");
  expect(row("Bank note · rate · term")?.[1]).toBe("Unknown amount · rate unknown · term unknown");
  expect(row("Seller note · rate · term")?.[0]).toBe("No note");
  expect(row("Coverage comparison target")?.[0]).toBe("1.25× user assumption");
  expect(row("Reporting period")?.[1]).toBe("Not recorded");
  expect(row("Source-note support")).toEqual(["1 current user-linked source note · not authenticated","No current user-linked source notes"]);
 });
});
