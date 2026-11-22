import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function luminance(hex: string) {
  const channels = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}
function contrast(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}
function focusColor(css: string) {
  const rule = css.match(/[^{}]*:focus-visible[^{}]*\{[^}]*outline:\s*3px\s+solid\s+(#[0-9a-f]{6})/i);
  if (!rule?.[1]) throw new Error("Focus outline color was not found.");
  return rule[1];
}

describe("focus indicator contrast", () => {
  it.each([
    ["web workbench", "app/workbench.css", "#f5f7f8"],
    ["extension popup", "extension/popup.css", "#f4f7f6"],
  ])("keeps the %s outline visible on white and its canvas", (_name, path, canvas) => {
    const css = readFileSync(path, "utf8"), outline = focusColor(css);
    expect(contrast(outline, "#ffffff")).toBeGreaterThanOrEqual(3);
    expect(contrast(outline, canvas)).toBeGreaterThanOrEqual(3);
  });

  it("shows focus on keyboard-scrollable tables and the active tab panel", () => {
    const css = readFileSync("app/workbench.css", "utf8");
    expect(css).toMatch(/\.tablescroll:focus-visible[^{}]*\{[^}]*outline:/);
    expect(css).toMatch(/\[role=tabpanel\]:focus-visible[^{}]*\{[^}]*outline:/);
  });

  it("stacks long memo and summary values at the narrow reflow breakpoint",()=>{
    const css=readFileSync("app/workbench.css","utf8");
    expect(css).toMatch(/@media\(max-width:420px\)[\s\S]*\.inspectorrows>div,\.memorow\{grid-template-columns:1fr\}/);
    expect(css).toMatch(/\.summarymetrics button\{align-items:flex-start;flex-direction:column\}/);
    expect(css).toMatch(/\.summarymetrics b\{white-space:normal;overflow-wrap:anywhere\}/);
  });

  it("keeps text-style actions and auxiliary links large enough to tap",()=>{
    const css=readFileSync("app/workbench.css","utf8");
    expect(css).toMatch(/\.textaction,\.smalllink\{[^}]*display:inline-flex;[^}]*min-height:44px/);
    expect(css).toMatch(/\.sitefooter a\{[^}]*display:inline-flex;[^}]*min-height:44px/);
    for(const path of ["app/install/page.tsx","app/case-study/page.tsx","components/ListingImport.tsx"]){
      expect(readFileSync(path,"utf8")).toContain("min-h-11");
    }
  });

  it("announces local PDF preparation as a busy status",()=>{
    const memo=readFileSync("components/workbench/Memo.tsx","utf8");
    expect(memo).toContain('aria-busy={loading}');
    expect(memo).toMatch(/role="status" aria-live="polite"/);
    expect(memo).toContain("Preparing the PDF memo on this device…");
  });

  it("associates the memo-required reporting period with its guidance",()=>{
    const inputs=readFileSync("components/workbench/Inputs.tsx","utf8");
    expect(inputs).toContain('aria-invalid={missingPeriod}');
    expect(inputs).toContain('aria-describedby={missingPeriod?"deal-period-error":undefined}');
    expect(inputs).toContain('id="deal-period-error" role="alert"');
  });
});
