import { describe, expect, it } from "vitest";
import { LatestOperation } from "@/lib/import/latest";

describe("latest local import operation", () => {
  it("keeps the newest file read current", () => {
    const operations = new LatestOperation();
    const first = operations.begin();
    const second = operations.begin();
    expect(first()).toBe(false);
    expect(second()).toBe(true);
  });

  it("invalidates a pending read when the active work changes", () => {
    const operations = new LatestOperation();
    const pending = operations.begin();
    operations.invalidate();
    expect(pending()).toBe(false);
  });

  it("allows a new operation after invalidating prior work", () => {
    const operations = new LatestOperation();
    const stale = operations.begin();
    operations.invalidate();
    const current = operations.begin();
    expect(stale()).toBe(false);
    expect(current()).toBe(true);
  });
});
