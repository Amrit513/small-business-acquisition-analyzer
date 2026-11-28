import { describe, expect, it } from "vitest";
import { isInstalledDisplay, type InstallDisplayEnvironment } from "../displayMode";

function environment(mediaMatches: boolean, iosStandalone?: boolean): InstallDisplayEnvironment {
  return {
    matchMedia: () => ({ matches: mediaMatches }),
    navigator: { standalone: iosStandalone } as Navigator & { standalone?: boolean },
  };
}

describe("installed web-app display detection", () => {
  it("recognizes a standard standalone display mode", () => {
    expect(isInstalledDisplay(environment(true, false))).toBe(true);
  });

  it("recognizes the iOS standalone signal", () => {
    expect(isInstalledDisplay(environment(false, true))).toBe(true);
  });

  it("keeps an ordinary browser tab in installation guidance", () => {
    expect(isInstalledDisplay(environment(false, false))).toBe(false);
  });
});
