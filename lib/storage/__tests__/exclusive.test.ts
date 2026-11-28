import { describe, expect, it } from "vitest";
import { ExclusiveOperation } from "@/lib/storage/exclusive";

describe("exclusive local storage mutations", () => {
  it("rejects overlap until the active mutation releases", () => {
    const operations = new ExclusiveOperation();
    const release = operations.begin();
    expect(release).not.toBeNull();
    expect(operations.begin()).toBeNull();

    release?.();
    expect(operations.begin()).not.toBeNull();
  });

  it("keeps a repeated release from ending a later mutation", () => {
    const operations = new ExclusiveOperation();
    const releaseFirst = operations.begin();
    releaseFirst?.();
    const releaseSecond = operations.begin();

    releaseFirst?.();
    expect(operations.begin()).toBeNull();
    releaseSecond?.();
    expect(operations.begin()).not.toBeNull();
  });
});
