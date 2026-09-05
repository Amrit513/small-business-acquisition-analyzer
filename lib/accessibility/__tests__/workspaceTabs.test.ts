import { describe, expect, it } from "vitest";
import { nextWorkspaceView } from "../workspaceTabs";

describe("workspace tab keyboard movement", () => {
  it.each([
    ["inputs", "ArrowRight", "results"],
    ["results", "ArrowRight", "compare"],
    ["compare", "ArrowRight", "inputs"],
    ["inputs", "ArrowLeft", "compare"],
    ["results", "ArrowDown", "compare"],
    ["results", "ArrowUp", "inputs"],
    ["compare", "Home", "inputs"],
    ["inputs", "End", "compare"],
  ] as const)("moves from %s with %s to %s", (current, key, expected) => {
    expect(nextWorkspaceView(current, key, true)).toBe(expected);
  });

  it("skips the locked investment memo in both directions", () => {
    expect(nextWorkspaceView("inputs", "ArrowRight", false)).toBe("compare");
    expect(nextWorkspaceView("compare", "ArrowLeft", false)).toBe("inputs");
  });

  it("leaves unrelated keys to their native behavior", () => {
    expect(nextWorkspaceView("inputs", "Tab", true)).toBeUndefined();
  });
});
