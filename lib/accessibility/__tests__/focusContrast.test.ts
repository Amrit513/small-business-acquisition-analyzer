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
    expect(css).toMatch(/\.sidecard:focus-visible[^{}]*\{[^}]*outline:/);
    expect(css).toMatch(/\[role=tabpanel\]:focus-visible[^{}]*\{[^}]*outline:/);
  });

  it("links every keyboard-scrollable financial table to visible scroll guidance",()=>{
    const scenarios=readFileSync("components/workbench/Scenarios.tsx","utf8");
    const comparison=readFileSync("components/workbench/Comparison.tsx","utf8");
    for(const id of ["scenario-scroll-help","sensitivity-scroll-help"]){
      expect(scenarios).toContain(`id="${id}"`);
      expect(scenarios).toContain(`aria-describedby="${id}"`);
    }
    expect(comparison).toContain('id="comparison-scroll-help"');
    expect(comparison).toContain('aria-describedby="comparison-scroll-help"');
    expect(scenarios).toContain("Keyboard users can focus the table region and use the arrow keys.");
    expect(comparison).toContain("Keyboard users can focus the table region and use the arrow keys.");
    expect(readFileSync("app/workbench.css","utf8")).toMatch(/\.scrollhint\{[^}]*font-size:14px;[^}]*overflow-wrap:anywhere/);
  });

  it("explains keyboard and narrow-screen navigation for the scrollable workspace tabs",()=>{
    const workbench=readFileSync("components/Workbench.tsx","utf8");
    const css=readFileSync("app/workbench.css","utf8");
    expect(workbench).toContain('id="workspace-tab-help"');
    expect(workbench).toContain('aria-describedby="workspace-tab-help"');
    expect(workbench).toContain("Use Left and Right Arrow keys to move between sections.");
    expect(workbench).toContain("On narrow screens, scroll horizontally to see every section.");
    expect(css).toMatch(/\.tabhint\{[^}]*font-size:14px;[^}]*overflow-wrap:anywhere/);
    expect(css).toMatch(/\.tabs\{[^}]*overflow-x:auto;[^}]*scroll-snap-type:x proximity/);
    expect(css).toMatch(/\.tabs button\{[^}]*min-height:46px;[^}]*scroll-snap-align:start/);
  });

  it("moves focus to the persistent library only after deletion succeeds",()=>{
    const workbench=readFileSync("components/Workbench.tsx","utf8");
    expect(workbench).toContain('ref={libraryRef} tabIndex={-1} aria-labelledby="deal-library-title"');
    expect(workbench).toContain('finally{finish();if(deleted)libraryRef.current?.focus();}');
  });

  it("moves listing-import focus when conditional controls disappear",()=>{
    const importer=readFileSync("components/ListingImport.tsx","utf8");
    expect(importer).toContain('focusNext.current="review";');
    expect(importer).toContain('titleRef.current?.focus();');
    expect(importer).toContain('focusNext.current="text";');
    expect(importer).toContain('textRef.current?.focus();');
    expect(importer).toContain('setOpen(false); toggleRef.current?.focus();');
  });

  it("associates listing-import recovery with the control that can resolve it",()=>{
    const importer=readFileSync("components/ListingImport.tsx","utf8");
    expect(importer).toContain('setErrorTarget("text")');
    expect(importer).toContain('setErrorTarget("file")');
    expect(importer).toContain('setErrorTarget("apply")');
    expect(importer).toContain('aria-describedby={errorTarget==="text"?"listing-review-error":undefined}');
    expect(importer).toContain('aria-describedby={errorTarget==="file"?"listing-review-error":undefined}');
    expect(importer).toContain('aria-describedby={errorTarget==="apply"?"listing-review-error":undefined}');
    expect(importer).toContain('setInvalidField("purchasePrice")');
  });

  it("moves guided next-action focus to the selected workspace tab",()=>{
    const workbench=readFileSync("components/Workbench.tsx","utf8");
    expect(workbench).toContain("pendingTabFocus=useRef<Tab|null>(null)");
    expect(workbench).toContain("pendingTabFocus.current=next;setTab(next)");
    expect(workbench).toContain("tabsRef.current[tabs.indexOf(tab)]?.focus()");
    expect(workbench).toContain("onClick={()=>moveToTab(nextAction.tab)}");
  });

  it("focuses the listing amount that blocks reviewed import",()=>{
    const importer=readFileSync("components/ListingImport.tsx","utf8");
    expect(importer).toContain('amountRefs.current[reviewed.field]?.focus();');
    expect(importer).toContain('amountRefs.current.purchasePrice?.focus();');
    expect(importer).toContain('aria-describedby={invalidField===field?"listing-review-error":undefined}');
  });

  it("stacks long memo and summary values at the narrow reflow breakpoint",()=>{
    const css=readFileSync("app/workbench.css","utf8");
    expect(css).toMatch(/@media\(max-width:420px\)[\s\S]*\.inspectorrows>div,\.memorow\{grid-template-columns:1fr\}/);
    expect(css).toMatch(/\.summarymetrics button\{align-items:flex-start;flex-direction:column\}/);
    expect(css).toMatch(/\.summarymetrics b\{white-space:normal;overflow-wrap:anywhere\}/);
  });

  it("keeps explicit evidence labels inside the available width",()=>{
    const css=readFileSync("app/workbench.css","utf8");
    expect(css).toMatch(/\.spread>\*\{min-width:0\}/);
    expect(css).toMatch(/\.evidence-row \.tag\{[^}]*max-width:100%;[^}]*white-space:normal;[^}]*overflow-wrap:anywhere/);
  });

  it("keeps text-style actions and auxiliary links large enough to tap",()=>{
    const css=readFileSync("app/workbench.css","utf8");
    expect(css).toMatch(/\.textaction,\.smalllink\{[^}]*display:inline-flex;[^}]*min-height:44px/);
    expect(css).toMatch(/\.sitefooter a\{[^}]*display:inline-flex;[^}]*min-height:44px/);
    for(const path of ["app/install/page.tsx","app/case-study/page.tsx","components/ListingImport.tsx"]){
      expect(readFileSync(path,"utf8")).toContain("min-h-11");
    }
  });

  it("lets the extension popup reflow instead of forcing a wide action row",()=>{
    const css=readFileSync("extension/popup.css","utf8");
    expect(css).toContain("width:min(390px,100vw);max-width:100%;overflow-x:hidden");
    expect(css).toMatch(/header\{[^}]*flex-wrap:wrap/);
    expect(css).toMatch(/\.metrics\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
    expect(css).toMatch(/\.actions\{[^}]*flex-wrap:wrap/);
    expect(css).toMatch(/\.actions button\{[^}]*flex:1 1 145px/);
  });

  it("announces PDF preparation outside the busy action group",()=>{
    const memo=readFileSync("components/workbench/Memo.tsx","utf8");
    expect(memo).toContain('<section className="sheet">');
    expect(memo).toContain('<div className="memoaction" aria-busy={loading}>');
    expect(memo).toContain('aria-describedby="pdf-memo-status"');
    expect(memo).toContain('id="pdf-memo-status"');
    expect(memo).toContain('role={error?"alert":"status"}');
    expect(memo).toContain('aria-live={error?"assertive":"polite"}');
    expect(memo).toContain('aria-atomic="true"');
    expect(memo).toContain("Preparing the PDF memo on this device…");
  });

  it("announces saved-deal import failures as assertive errors",()=>{
    const workbench=readFileSync("components/Workbench.tsx","utf8");
    expect(workbench).toContain('[importError,setImportError]=useState("")');
    expect(workbench).toContain('setImportError(dealImportFailureMessage(error))');
    expect(workbench).toContain('aria-describedby={importError?"deal-import-error":undefined}');
    expect(workbench).toContain('id="deal-import-error"');
    expect(workbench).toContain('role="alert" aria-live="assertive" aria-atomic="true"');
  });

  it("announces JSON export failures assertively at the failed control",()=>{
    const workbench=readFileSync("components/Workbench.tsx","utf8");
    expect(workbench).toContain('[exportError,setExportError]=useState("")');
    expect(workbench).toContain('[exportTarget,setExportTarget]=useState<string|null>(null)');
    expect(workbench).toContain('aria-describedby={exportTarget==="current"?"deal-export-error":undefined}');
    expect(workbench).toContain('aria-describedby={exportTarget===x.id?"deal-export-error":undefined}');
    expect(workbench).toContain('id="deal-export-error"');
    expect(workbench).toContain('setExportTarget("current");setExportError(');
    expect(workbench).toContain('setExportTarget(item.id);setExportError(');
  });

  it("announces local-storage failures assertively at the affected action",()=>{
    const workbench=readFileSync("components/Workbench.tsx","utf8");
    expect(workbench).toContain('[noticeError,setNoticeError]=useState(false)');
    expect(workbench).toContain('role={noticeError?"alert":"status"}');
    expect(workbench).toContain('aria-live={noticeError?"assertive":"polite"}');
    expect(workbench).toContain('aria-describedby={noticeTarget==="save-current"?"workspace-notice":undefined}');
    expect(workbench).toContain('aria-describedby={noticeTarget==="save-alternative"?"workspace-notice":undefined}');
    expect(workbench).toContain('aria-describedby={noticeTarget==="library"?"workspace-notice":undefined}');
    expect(workbench).toContain('aria-describedby={noticeTarget===`delete:${x.id}`?"workspace-notice":undefined}');
  });

  it("announces source-note failures assertively and associates the affected fields",()=>{
    const evidence=readFileSync("components/workbench/Evidence.tsx","utf8");
    expect(evidence).toContain('role={feedback.error ? "alert" : "status"}');
    expect(evidence).toContain('aria-live={feedback.error ? "assertive" : "polite"}');
    expect(evidence).toContain('id="source-note-feedback"');
    expect(evidence.match(/aria-describedby={describedBy}/g)).toHaveLength(3);
    expect(evidence).toContain('error.message : "Check the source note.", true');
  });

  it("associates the memo-required reporting period with its guidance",()=>{
    const inputs=readFileSync("components/workbench/Inputs.tsx","utf8");
    expect(inputs).toContain('aria-invalid={missingPeriod}');
    expect(inputs).toContain('aria-describedby={missingPeriod?"deal-period-error":undefined}');
    expect(inputs).toContain('id="deal-period-error" role="alert"');
  });

  it("associates scenario table values with explicit row and column headers",()=>{
    const scenarios=readFileSync("components/workbench/Scenarios.tsx","utf8");
    expect(scenarios).toContain('map(h=><th scope="col" key={h}>{h}</th>)');
    expect(scenarios).toContain('<th scope="col">SDE / entered SDE</th>');
    expect(scenarios).toContain('<th scope="col">Bank APR change</th>');
    expect(scenarios).toContain('<th scope="col">Cash to equity</th>');
    expect(scenarios).toContain('<th scope="row">{c.earningsPct}%</th>');
  });
});
