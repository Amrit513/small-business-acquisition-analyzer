import {describe,expect,it} from "vitest";
import {calculate} from "@/lib/calculations/workbench";
import {blankDeal,sampleDeal} from "@/lib/workspace/deal";
import {modelScreenStatus,sourceNoteStatus} from "@/lib/reporting/status";

describe("memo reporting status",()=>{
 it("keeps model readiness separate from source-note support",()=>{
  const complete=calculate(sampleDeal());
  const incomplete=calculate(blankDeal("draft","2026-11-17T00:00:00.000Z"));
  expect(modelScreenStatus(complete)).toBe("Complete model screen");
  expect(sourceNoteStatus(complete)).toBe("1 current user-linked source note · not authenticated");
  expect(modelScreenStatus(incomplete)).toMatch(/^Incomplete model screen · \d+ unresolved issues$/);
  expect(sourceNoteStatus(incomplete)).toBe("No current user-linked source notes");
 });
});
