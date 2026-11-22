# Acquisition Lens redesign: working audit and release gates

The owner's September 5 master product/design/engineering specification is the release direction. Preserve the existing production app until design and validation are complete. Work on `agent/acquisition-lens-extension-app` through draft PR #1, never merge automatically. Cloud AI remains disabled. No paid services, store submission, or transmission of financial data.

## Audit baseline

Inspected the current branch/PR, dirty local checkout, CLAUDE.md, architecture, formulas, scenario engine, financing schedules, workspace and PDF report. The PR baseline was `16d5435b06d39c59a85ab60a2e345ef5e3c9d285`, newer than the original brief's checkpoint. Preserve all intervening import and keyboard work.

- Scenarios discarded entered SDE when it differed from revenue minus expenses. Corrected in milestone 1 with an explicit fixed-dollar reconciliation; it is not authenticated evidence or an approved add-back.
- Scenarios extended initial debt service past maturity. Corrected in milestone 1 using the combined payment schedule and independent zero-interest examples.
- Owner compensation vs return on capital, capex and working capital remain unresolved. Current cash flows must retain explicit simplified pretax exclusions.
- Unknown listing values still become zero: introduce a versioned unknown-aware domain before claiming evidence integrity. Preserve old snapshots with explicit migration status.
- Zero-equity returns, no-debt coverage labels, score bounds, funding readiness and benchmark sourcing still need the specified model audit.
- The current workspace has a large marketing heading, three work tabs and a default example not sufficiently separated from user work. Replace with a compact deal header, labeled demo/start-new flow, visible saved deals, and Inputs/Evidence/Scenarios/Memo/Comparison navigation.
- Current PDF lacks the complete evidence-linked scenario memo and model version. It is not the finished reporting deliverable.
- Earlier desktop browser checks reproduced keyboard defects; newer code is unit/build validated, not proven on a physical phone or installed extension. Browser tooling cannot currently reach local localhost. Never relabel those checks as completed.

## Coherent milestones

1. **Scenario model correction:** earnings reconciliation, maturity-aware payments, explanatory UI, independent tests and matching formulas.
2. **Representative visual workflow:** implement the specified canvas/text/green/lime/surface/divider tokens; compact typography with tabular numbers; labeled demo and fresh-deal entry; one complete desktop/mobile inputs-to-inspectable-metric flow. Capture actual before/after screenshots and check contrast/reflow.
3. **Domain integrity:** separate unknowns from zeros with safe migration; reconcile buyer labor and cash requirements; correct undefined metrics and readiness; invalidate changed evidence links; source or relabel valuation assumptions.
4. **Signature interactions:** complete inspectable metrics, downside controls with numeric alternatives/reset, evidence-linked conclusions, then extend consistent navigation to all views.
5. **Extension and reports:** restricted-page/storage recovery, consistent compact design, reviewed handoff, readable versioned PDF with reconciled scenarios/source appendix and exact comparison assumptions.
6. **Acceptance and interview evidence:** actual supported-browser workflows and extension loading, phone installation when available, keyboard/zoom/contrast checks, PDF inspection, reproducible lab measurements, case study/demo/attribution and user-test script. No invented participants or performance results.

## Release evidence ledger

| Gate | Current status |
| --- | --- |
| Model integrity | Partial: scenario correction implemented; other audited issues remain |
| End-to-end workflow | Pending acceptance on redesigned source |
| Visual finish | Pending desktop/mobile redesign and screenshots |
| Evidence integrity | Pending unknown-aware migration and linkage invalidation |
| Extension | Package builds; real installed capture/review/save/export/handoff pending |
| Phone experience | Physical installation/touch acceptance pending |
| Accessibility | Keyboard logic tests exist; full manual/automated acceptance pending |
| Privacy | Cloud endpoint disabled; release-level transfer/cache audit pending |
| Engineering | Rerun full tests, strict TypeScript, extension and production builds per milestone |
| Deployment | Preserve current production; new release blocked on prerequisites |
| Portfolio honesty | Case study, measured evidence, demo and attribution pending |

## Open-source selection, not dependency accumulation

Repository review on September 5: [Radix Primitives](https://github.com/radix-ui/primitives) (MIT) for accessible interaction primitives; [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT) for selectively owned UI components; [Playwright](https://github.com/microsoft/playwright) ([Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE)) for browser test infrastructure; [axe-core](https://github.com/dequelabs/axe-core) (MPL-2.0) for automated accessibility checks. These are candidates, not installed or verified integrations. Before adoption pin a compatible version, inspect current maintenance/security, retain applicable license notices and assess bundle cost. Automated accessibility checks do not certify WCAG compliance. None replaces independent financial tests.

The existing Next.js, React, Vitest, IndexedDB wrapper and deferred PDF renderer remain in place. Do not clone whole products or paste unreviewed financial engines into this project.

## November 15 working-branch checkpoint (version 3, not a production release)

Recovered draft PR #1 branch after the local workspace reset; September source at `2aca527` had the old interface. The current workbench defines unknown separately from zero, buyer pay separately from cash returned on equity, sources/uses including closing and initial working capital, actual loan maturities, a documented earnings bridge, editable valuation assumptions and bounded/inapplicable screening components. The active formulas are in [WORKBENCH-MODEL.md](WORKBENCH-MODEL.md); older formula/benchmark code remains historical. The dormant financial POST handler was removed from the shipped interface; the cloud route still returns 503.

Local evidence on November 15: 139 unit tests passed before the last UI copy changes, TypeScript passed, Manifest V3 ZIP contained 10 files including MIT LICENSE and privacy statement, production Next.js build produced `/`, `/case-study`, `/install` and manifest; production dependency audit reported zero known vulnerabilities at that checkpoint. The supervised desktop Chrome preview exercised fictional sample, formula inspector, sensitivity preset, saved library, comparison, and creation of an explicit PDF download link. A separate fictional sample PDF was rendered, extracted with Poppler and visually inspected on both A4 pages; its headline spacing was corrected. Re-run the final gates after changes, and record actual branch commit and preview deployment rather than treating these local checks as public verification.

Pending release gates: actual phone reflow/installation, 200% zoom and full keyboard/focus/contrast assessment, supported browser unpacked-extension capture and restore, a captured downloaded-PDF file from the browser, public commit-specific routes/ZIP/notices, and professional review of transaction applicability. No customer results or legal clearance are claimed. Keep existing production in place until the checks needed for a responsible release are complete.

## Keyboard interaction follow-up

The financial metric inspector now uses the browser's modal dialog behavior instead of a visually modal overlay. In supervised desktop Chrome, opening it restricted the accessibility tree to the dialog, Tab remained inside, Escape closed it, and focus returned to the original Inspect button. This is a targeted manual check, not a full WCAG audit or phone acceptance.

## Extension capture selection follow-up

Click-to-capture now prefers an explicit selection, then a nonempty main region, then a single article. Multiple article cards without a main region require explicit selection rather than silently importing the first card. Editable controls are excluded, and the tab-change check and 60,001-character transfer cap remain. Five synthetic page-selection tests, 144 total unit tests, strict TypeScript, extension packaging and the Next.js production build passed locally on November 15. This does not establish that the unpacked extension has been exercised on a real listing in Chrome or Edge; that release gate remains pending.

In a supervised local Chrome workbench session on November 15, the fictional Atlas sample exported a JSON download. Importing that same browser-downloaded file displayed “Imported as a new unsaved deal. Review its assumptions,” and the primary save control changed to “Save deal.” This checks one real export/import path only; malformed-file recovery, persistence after a fresh browser session, phone reflow and physical-device installation still need separate acceptance.

## PDF cash-flow and funding transparency

The investment memo now shows bank and seller notes separately, states total sources, and no longer combines unknown note amounts by substituting zero. Its scenario page adds an exact first-year pretax cash-flow bridge from SDE through buyer compensation, replacement labor, maintenance capital expenditure, working-capital increase and scheduled debt to cash returned on equity. The bridge explicitly separates pay for work from investment return and keeps taxes and sale proceeds outside scope. The report footer is anchored inside the second page so the added explanation cannot create a nearly empty trailing page.

Local verification on November 15 rendered the fictional Atlas memo to two A4 pages, extracted the expected funding and cash-flow labels with Poppler, and visually inspected both rendered pages for clipping and page breaks. All 144 unit tests, strict TypeScript, the 10-file extension package and the Next.js production build also passed. This is local fixture evidence, not public-deployment, physical-phone or installed-extension verification.

## Import recovery and unsaved work follow-up

The workbench now tracks unsaved edits independently of the status message. An invalid import leaves the current deal untouched and gives a file-format/size recovery message; a valid import is parsed before asking to replace an unsaved deal. A rejected replacement retains the current deal, and a successful import remains protected until it is saved. Opening a saved version clears the unsaved flag; opening a migrated legacy copy does not. This corrects a path where an error or a successful import changed the status text and accidentally disabled the discard warning. Local unit, type, extension-package and production-build checks passed. Browser acceptance for malformed imports could not run in this checkout because Chromium failed to open its process socket; it remains an open manual acceptance check.

The listing-review handoff now keeps the reviewed listing and amounts visible when a user cancels replacement of unsaved work. The panel explains that the current deal was kept so the user can save or export it and retry. The panel also describes missing figures and financing as unknown, matching the version-three model. This is source and build validated; the cancelled-dialog flow still needs browser acceptance.

## Touch targets and saved-deal action names

The compact saved-deal controls, evidence actions and extension buttons now meet the product’s approximately 44-pixel touch-target goal. Saved-deal Open, Export and Delete controls also expose the deal name in their accessible names, so repeated controls are distinguishable to screen-reader and voice-control users. This is source and build validation; phone touch testing and a complete assistive-technology pass remain pending.

## Listing capture provenance

Listing JSON with a missing, malformed or ambiguous capture timestamp now keeps the capture time unknown instead of substituting the import time. Valid timezone-aware ISO timestamps are normalized to UTC, while the extension and evidence view label unavailable capture time explicitly. This prevents imported evidence from appearing more recent than its source supports. The source excerpt, field value and listing-claim status remain unchanged.

## Extension draft recovery

Capturing a new listing after an unreadable saved draft now dismisses the stale recovery action and tells the user to save to replace that draft. Saving, clearing or explicitly discarding also resets the recovery state. This prevents the old recovery control from deleting a newly saved valid capture. Browser-installed acceptance still distinguishes a source/build check from exercised Chrome or Edge behavior.

## Narrow reflow safeguards

Below 420 CSS pixels, the brand and site navigation now reflow into separate rows instead of competing for one fixed header line. Long user-controlled deal names, saved-deal labels and evidence metadata can wrap without forcing page-level horizontal overflow; formula-inspector rows also stack at that width. These safeguards target narrow phone layouts and zoom reflow, but physical-device and manual 200% zoom acceptance remain pending.

## Listing reporting-period warnings

The shared web/extension extractor now detects monthly revenue, SDE and EBITDA claims even when “monthly” appears in the label rather than the amount. It does not multiply them into annual values. A generic revenue label that supplies a usable amount but does not say annual or TTM receives a separate reporting-period warning. Users must confirm and enter annual USD values during review; unknown figures remain unknown.

## PDF provenance labels

The memo header now prints “Period not recorded” when a deal has no reporting period. Source-appendix entries likewise label missing location, period and review date instead of rendering empty separators. The repeatable PDF fixture script includes a fictional missing-period/date case so Poppler text extraction can verify these labels without treating an import or generation time as source provenance.

## Unknown evidence-date round trip

An imported listing with no trustworthy capture timestamp can now be saved, exported and reimported while its linked evidence date remains empty. The validator still rejects malformed or impossible dates, and source notes entered in the Evidence form still require an explicit review date. This closes a failure where honest unknown provenance passed listing review but then made the deal fail snapshot serialization.

## Extension workflow integration coverage

The popup integration fixture now exercises an unreadable saved draft followed by capture, local save, JSON export, fragment handoff and a fresh popup restore. It verifies the exported allowlisted values, download filename, fragment-only transfer and restored title. This covers the extension logic with browser APIs simulated in Vitest; it does not replace loading the package and exercising the workflow in Chrome or Edge.

## Focus-indicator contrast

The workbench focus outline now uses brand green rather than the lighter lime, raising calculated contrast from 2.20:1 to 9.25:1 against white and from 2.05:1 to 8.61:1 against the canvas. A regression test reads the actual web and extension CSS and requires at least 3:1 against white and each product canvas. This verifies color math, not a complete keyboard or assistive-technology review.

## Remaining compact touch targets

The downside sliders, checkbox rows and primary site navigation now provide at least 44 CSS pixels of interactive height. The extension source link uses the same minimum target while preserving long-URL wrapping. These are source and build safeguards for phone-sized layouts; physical touch testing, 200% zoom review and the complete keyboard/assistive-technology acceptance remain pending.

## Field-specific validation guidance

Invalid money, interest-rate and loan-term inputs now expose guidance for their own supported boundary instead of giving every field a loan-term message. The shared validation boundary supplies the message, and the associated error uses an alert role while the input retains `aria-invalid` and `aria-describedby`. This improves error recovery in source; assistive-technology and physical-device acceptance remain pending.

## Strict listing import shape

Listing JSON and extension handoffs now reject unknown top-level, financial-value and excerpt fields instead of silently dropping unsupported data. Optional metadata is type- and length-checked, while a missing or malformed string capture timestamp still remains explicitly unknown. This keeps the narrow listing schema separate from saved-deal and evidence schemas.

## Consistent memo provenance

The on-screen memo now shows each linked figure's source location, reporting period and review date alongside its excerpt, matching the exported PDF appendix. Both views use one tested formatter, including explicit labels when period or date provenance is unknown.

## Shared reviewed-amount validation

The website and extension now use one pure validator for edited listing amounts and excerpt invalidation. The website associates a rejected amount with the exact input through `aria-invalid` and `aria-describedby`, while both surfaces keep unknown values blank and reject ranges or unsupported currency text.

## Assumption-led comparison

Deal comparison now exposes the reporting period, replacement labor, maintenance capex, working-capital increase, note rate and term, funding difference and each deal's coverage comparison target. Incomplete deals remain visibly incomplete and unranked; the table explains differences without calling the highest number the best acquisition.

## Recoverable evidence removal

Each repeated source-note removal control now includes the figure in its accessible name and offers an immediate undo. Restore is guarded by the linked value and reporting period, so a changed figure cannot silently regain stale provenance.

## UTF-8 import compatibility

Current deal exports, legacy deal exports and extension listing JSON now accept the single leading byte-order mark that some Windows editors add to otherwise valid UTF-8 files. File-size limits and strict schema validation still run on the original input, and markers anywhere else remain invalid JSON. This improves file recovery without coercing values or silently discarding unsupported fields.

## Consistent financing terms in reports

Comparison, the on-screen memo and the PDF now share one formatter for each bank and seller note's amount, annual rate and term. Zero debt is labeled as no note, while missing amounts, rates and terms remain explicit unknowns. The exported memo therefore retains the financing assumptions that explain its scheduled debt and coverage outputs.

## Extension validation focus

When extension review rejects an edited amount during save, export or handoff, focus now moves to that exact field and the input references the live error message. Correct fields clear the temporary relationship. Popup integration coverage confirms that invalid data is neither saved nor transferred while the rejected field is exposed to keyboard and assistive-technology users.

## Coverage in exported scenarios

Each projected year in the PDF now reports scenario cash, flat cash, screening coverage and scheduled debt from one tested formatter. Coverage becomes “No scheduled debt” after note maturity instead of displaying an infinite ratio or implying lender approval. This brings the exported scenario table in line with the interactive workbench.

## Current workspace tab navigation

The live five-tab workbench now uses the tested keyboard-navigation helper instead of a separate inline implementation. Arrow Left/Right and Arrow Up/Down wrap across Deal inputs, Evidence, Scenarios, Memo and Comparison; Home and End move to the first and last tab. Regression coverage now targets the current five-tab interface rather than the retired three-view layout.

## Focusable result regions

The active tab panel and each keyboard-scrollable scenario, sensitivity and comparison table now use the same high-contrast visible focus indicator as the workbench controls. A stylesheet regression check protects both selectors. This closes an invisible keyboard-focus position in source; full manual keyboard, screen-reader and 200% zoom acceptance remains pending.

## Financial-setting validation feedback

Out-of-range valuation multiples, coverage targets, projection lengths and scenario percentages now expose an invalid state and an associated range/step message. The calculator still retains the last valid assumption while a rejected value is being corrected, but no longer does so silently. This is source and build validation; browser and assistive-technology acceptance remains pending.

## Exact version-three import structure

Version-three deal imports now reject unknown properties in the export envelope, deal, settings, values, evidence map and evidence rows. This prevents a typo or unsupported newer field from being silently discarded and then lost on re-export. Listing payloads continue through their separate allowlisting parser. Regression cases cover every tightened object boundary.

## Coverage-target disclosure in reports

The on-screen memo and exported PDF now print the actual user-selected debt-coverage comparison target beside a qualification that it is a screening assumption, not a lender standard. This keeps the threshold visible where a reader evaluates the reported coverage instead of relying on general footer language. The fictional fixture remains two A4 pages after spacing correction; Poppler text extraction and visual review confirmed the disclosure, valuation paragraph, footer and page breaks.

## Extension storage-failure recovery

Extension save, clear, corrupt-draft deletion and startup restore failures now use actionable messages instead of exposing raw browser errors. A failed deletion leaves the reviewed draft visible and accurately states that it may still be stored; a failed save directs the user to JSON export. Popup integration coverage exercises rejected storage writes and deletion while confirming that the reviewed draft is retained.

## Saved-library action recovery

Saved-record JSON export now reports preparation failures without changing the local snapshot. Deletion success removes the record from the visible library immediately; a later database refresh can no longer turn a completed deletion into a false failure message. A rejected deletion keeps the record visible and explicitly says it remains on this device.

## Deal-scoped evidence undo

Evidence removal undo now records the source deal identifier as well as the figure and source note. Restoration is rejected if the active deal has been replaced, even when the new deal happens to use the same value and reporting period. The existing value and period checks still prevent edited figures from silently regaining stale provenance.

## Strict UTF-8 file decoding

Deal and listing JSON file imports now decode bytes with a fatal UTF-8 boundary before JSON parsing. Malformed byte sequences are rejected instead of being silently replaced inside names or evidence excerpts. Declared and actual byte lengths are both checked, and a valid leading UTF-8 byte-order mark remains supported.

## Extension capture replacement guard

Starting another page capture while a listing is already under review now asks before replacing it. Cancelling retains the current edited values and stops before querying the active tab or injecting the capture function. This protects unsaved extension work in source and simulated browser-API integration tests; installed Chrome/Edge acceptance remains pending because Chromium cannot create its process socket in this workspace.

## Narrow memo and summary reflow

Below 420 CSS pixels, memo metrics and sidebar metric buttons now stack their labels and values instead of forcing long text into competing columns. Values such as “No scheduled debt” can wrap within their own region, and a stylesheet regression protects the breakpoint. This reduces a source-level phone and zoom overflow risk; manual 200% zoom and physical-device acceptance remain pending.

## Honest evidence status in comparison

Deal comparison now labels evidence as current user-linked source notes instead of implying that a count represents verified evidence. A deal with no current links says “No current source-note links,” while the comparison introduction explains that a source note records what a user reviewed and does not authenticate a seller or document. This keeps evidence support separate from economic readiness and model outputs.

## Shared memo readiness and evidence status

Comparison, the on-screen memo and the exported PDF now use one tested reporting status for model completeness and a separate status for current source-note support. A complete model screen can still state “No current source-note links,” and incomplete work reports its unresolved issue count. The preparation message now calls the output a screening memo rather than implying that completing inputs alone makes an acquisition decision-ready. The fictional memo remained two A4 pages after the compact PDF status line was rendered, text-extracted and visually inspected.

## Correct next-action routing

The prominent next-action button now opens Deal inputs for missing figures, funding differences, financing terms and other model-input blockers. Earnings-bridge explanations and the review acknowledgement continue to open Evidence; a complete model opens Scenarios. A pure resolver and regression cases protect the touch and keyboard path from returning to the previous hard-coded Evidence destination.

## Extension clear confirmation

Clearing a reviewed extension listing now asks for confirmation and recommends exporting JSON first when a backup is needed. Cancelling leaves the edited review visible and does not call browser storage removal. Simulated popup coverage protects the cancellation path; this does not replace installed Chrome or Edge acceptance.

## Extension export failure recovery

If the browser refuses the extension's JSON download click after a temporary Blob URL is created, the popup now revokes that URL immediately, preserves the reviewed listing and shows an actionable message without exposing the raw browser error. Simulated popup coverage verifies cleanup and retained review state; an installed-browser download remains a separate acceptance gate.

## Round-trip-safe listing warnings

The strict listing boundary now validates the final deduplicated warning set after adding the required independent-review notice. A payload whose warning count would exceed the supported limit after normalization is rejected immediately instead of being accepted once and then failing its own JSON export or fragment handoff. Boundary tests exercise the largest accepted set and the first rejected set through parse, export and restore.

## Restricted-page and handoff recovery

When the browser denies page-script access, the extension now retains the current reviewed listing, re-enables capture and gives stable copy-to-website guidance instead of exposing the browser's internal error. If a reviewed fragment cannot be opened in a new tab, the review likewise remains available with an explicit JSON-export fallback. Simulated browser-API integration tests cover both failures; installed Chrome or Edge acceptance remains pending.

## Restorable extension titles

Before save, export or handoff, the extension now validates the edited business name and canonicalizes the complete reviewed draft through the same strict parser used during startup restore. An overlong title focuses the title input, exposes its invalid state and leaves the prior saved draft untouched. This closes a path where browser autofill or scripted input could persist a draft that the extension could not reopen.

## Future capture-date provenance

The listing boundary now treats a capture timestamp more than five minutes ahead of the importing device as unknown instead of presenting it as source provenance. The small tolerance permits ordinary clock drift; malformed, impossible and clearly future timestamps remain empty through save, export and evidence linkage.

An unpacked Chromium acceptance attempt on November 21 rebuilt the 10-file extension and prepared a local fictional listing, but Chromium aborted before opening a page or extension because this workspace denied its process-singleton socket (`Operation not permitted`). No capture action ran, so installed Chrome/Edge acceptance remains pending rather than being inferred from integration tests.

## Future source-note dates

Manual source notes and version-three snapshot imports now reject review dates after the importing device's current local date. The date control exposes the same maximum before submission, while an empty date remains allowed only for imported listing evidence whose capture time is honestly unknown. Future dates therefore cannot survive into comparison or memo provenance.

Listing evidence now derives its review date from the capture instant in the importing device's local calendar rather than slicing the UTC timestamp. This prevents an evening capture in a western timezone from appearing to have been reviewed “tomorrow,” while retaining the exact ISO capture instant in the original listing record.

## Local PDF generation date

Prepared PDF memos now label their generation date with the user's local calendar day instead of slicing the UTC instant. This prevents an evening memo in a western timezone from being dated one day ahead. Exact saved-record timestamps remain ISO instants; only the human-facing report date uses the local day.

## Plausible saved-record timestamps

Current and legacy deal imports now reject save timestamps more than five minutes ahead of the importing device, using the same bounded clock-drift rule as listing capture provenance. A malformed future record remains recoverable as its original JSON but cannot sort above genuine work or present false recency in the local library.

## Installed web-app state on iPhone and iPad

The installation panel now recognizes iOS's standalone web-app signal in addition to the standard display-mode media query, and it responds when the browser display mode changes. This prevents an already installed iPhone or iPad launch from continuing to show installation instructions. Pure regression cases cover standard standalone, iOS standalone and ordinary browser-tab states; physical phone installation and touch acceptance remain pending.

## Strict saved-deal object shape

Legacy version-one and current version-two deal imports now reject unsupported envelope, deal, business, financing, seller-note and evidence fields. Unknown assumptions and evidence labels can no longer be silently discarded while an import appears successful. Supported optional fields, partial legacy evidence, losses and zero values remain valid; version-three workspace imports continue through their separate strict boundary.

## Conservative missing-evidence migration

A legacy or manual deal without a saved evidence map now labels every financial field, including purchase price, as an unverified assumption. It no longer assigns a marketplace-listing label when no listing source exists. Actual reviewed listing imports still assign the listing label only to values present in the captured listing, so this migration does not erase supported provenance.

## Consistent deal-file decoding

The supported legacy deal-file reader now uses the same byte-level, fatal UTF-8 decoder as the current workbench and listing importer. It checks both the declared file size and the bytes actually returned, and malformed byte sequences are rejected instead of being silently replaced before schema validation. This aligns every local JSON file entry point with the documented import boundary.

## Auxiliary phone touch targets

Text-style workbench actions, footer navigation, the install-page return link, listing-source link and case-study formula link now expose at least 44 CSS pixels of interactive height. Their compact visual treatment is retained while the actual hit area is usable at narrow widths and browser zoom. A source regression protects these target sizes; physical touch and 200% zoom acceptance remain pending.

## Partial debt assumptions in reports

When a bank or seller-note principal is unknown, comparison, on-screen memo and PDF now retain any entered annual rate and term instead of collapsing the entire financing line to “Unknown amount.” Each missing term remains explicitly unknown, and an explicit zero principal still reports “No note.” This preserves partial assumptions without inventing scheduled debt.

## Extension export preparation recovery

If the browser cannot create the temporary Blob URL needed for an extension JSON export, the popup now keeps the reviewed listing visible and gives a stable retry message instead of exposing a raw browser error. Existing cleanup still revokes a URL when a later download click fails. Simulated browser-API coverage protects both stages; an installed-browser download remains a separate acceptance gate.

## Workbench JSON download recovery

Current-deal and saved-deal JSON backups now share one tested browser-download boundary. Preparation and download-click failures return stable recovery guidance instead of exposing browser internals, and a failed click immediately revokes its temporary Blob URL. The active deal and local saved snapshot remain unchanged. Browser APIs are simulated in the regression cases; real mobile and desktop downloads remain separate acceptance checks.
