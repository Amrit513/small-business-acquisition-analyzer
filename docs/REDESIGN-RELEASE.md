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

## Safe listing-import recovery

Listing JSON imports now use allowlisted recovery copy instead of exposing raw browser, filesystem or JSON-parser errors. Oversized and invalid UTF-8 files receive specific guidance; every other failure is described as an unsupported Acquisition Lens listing export. Each rejection confirms that the current listing review is unchanged. Pure regression cases protect the categories and fallback; installed-browser acceptance remains pending.

## Extension error announcements

Extension action and capture failures now switch the popup message region to an assertive alert, while progress and successful outcomes remain polite status updates. The atomic live region prevents partial recovery messages from being announced. Simulated popup coverage verifies both the urgent error state and its reset after a successful retry; installed Chrome/Edge assistive-technology acceptance remains pending.

## Isolated unreadable local snapshots

A structured-clone record that JSON cannot serialize no longer aborts the entire saved-deal library. The unreadable record stays visible and deletable, is explicitly labeled as unavailable for export, and cannot be opened. Serializable malformed records retain their original recovery JSON and export path. Pure regression coverage uses a cyclic record; real IndexedDB corruption recovery remains pending browser acceptance.

## Explicit cancelled deal imports

After a valid deal file is parsed, declining the unsaved-work replacement prompt now announces that the current deal was kept and the selected file was not applied. Invalid files remain rejected before the replacement prompt, and stale file reads remain unable to publish either a deal or a message. This aligns deal-file cancellation with the reviewed listing handoff; real file-picker acceptance remains pending.

## Linkable evidence figures

The source-note form now offers only figures that have an entered value. Unknown values stay unavailable instead of failing after submission, while an explicit zero remains linkable. The selector explains this boundary, exposes its help programmatically and disables submission when no figure is available. A pure regression protects the unknown-versus-zero distinction; keyboard and assistive-technology acceptance remain pending.

## Visible seller-compensation reconciliation

The on-screen memo and exported PDF now show seller compensation identified in SDE add-backs beside operating earnings, entered SDE and the earnings bridge. Both state that the amount is already embedded in entered SDE and is not added again. Comparison exposes seller compensation and the calculated bridge as separate assumptions. Cash-flow formulas are unchanged; browser-downloaded PDF inspection remains pending.

## Honest seller-compensation disclosure states

Memo and PDF reporting now distinguish an entered seller-compensation add-back from an explicit zero and an unknown amount. Only an entered positive amount is described as embedded in SDE; a missing value remains visibly unentered, while every state confirms that the model does not add a separate seller-compensation amount. A shared pure formatter and three regressions keep both report surfaces aligned. Financial calculations are unchanged.

## Explicit remaining earnings adjustment

The workbench now calculates the portion of the SDE bridge left after entered seller compensation and shows it in Evidence, the on-screen memo, PDF and deal comparison. The remainder stays unknown when seller compensation is unknown instead of treating the missing amount as zero. This gives reviewers an exact amount to reconcile to other add-backs without changing projected SDE or cash flow.

## Canonical listing titles

Listing extraction, JSON parsing and final amount review now trim business names and replace a whitespace-only title with “Imported listing.” This prevents a syntactically valid listing handoff or local file from creating a blank-looking deal while preserving the existing maximum-length boundary and all financial values, excerpts and warnings.

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

Current-deal and saved-deal JSON backups now share one tested browser-download boundary. Preparation and download-click failures return stable recovery guidance instead of exposing browser internals. A URL is immediately revoked when the later download-element setup or click fails, including partial preparation after URL creation. The active deal and local saved snapshot remain unchanged. Browser APIs are simulated in the regression cases; real mobile and desktop downloads remain separate acceptance checks.

## Latest-only local file imports

Deal and listing JSON readers now apply results only while their file selection is still current. Choosing a newer file, editing or replacing the active deal, manually extracting listing text, or closing the listing importer invalidates an earlier pending read. A slow prior file therefore cannot replace newer work or surface a stale error after the user has moved on. This safeguard is covered at the operation boundary; browser import acceptance remains pending.

## Deal-scoped PDF preparation

Changing or replacing the active deal now invalidates an in-progress PDF render, clears its loading state and removes any prior report error. A late success or failure from the previous deal cannot publish a download link or error into the new workspace, and a new report can start immediately. The latest-operation boundary is regression tested; local rendered-fixture checks do not replace mobile and desktop download acceptance.

## Announced PDF preparation state

While a memo is rendering locally, the memo region now exposes its busy state and its polite live status announces that preparation is in progress. The message replaces the previous idle instruction until the render succeeds or fails, while the preparation control remains disabled against duplicate activation. Source regression coverage protects the semantics; screen-reader and browser acceptance remain pending.

## Named-deal memo readiness

A blank or whitespace-only deal name now creates an explicit model issue, prevents the optional screening score and blocks PDF preparation until corrected. The name input exposes its invalid state and associated alert at the same boundary. This aligns live model readiness with the existing saved-file validator, so an unnamed deal cannot appear report-ready while remaining impossible to save or export validly.

## Serialized extension actions

The extension popup now permits only one capture, save, export, clear or handoff operation at a time. Its workspace exposes the busy state and disables every conflicting action until the active browser or storage request settles, including failure cleanup. Simulated browser-API coverage confirms that a delayed save cannot race a clear and leave the stored draft in an ambiguous state; installed Chrome or Edge acceptance remains pending.

## Serialized saved-library mutations

The website now permits only one local deal save or deletion at a time. Conflicting mutation controls remain disabled while IndexedDB work settles, the library exposes its busy state, and a second same-tick request is rejected by the operation boundary rather than relying only on React rendering. This prevents a delayed save from recreating a snapshot that the user just deleted. The lock is unit tested; real mobile and desktop IndexedDB acceptance remains pending.

## Reporting-period validation guidance

The annual reporting-period input now exposes the same invalid state that already prevents memo readiness and screening-index calculation. Its field-specific alert is programmatically associated with the input, so keyboard and assistive-technology users receive the resolution at the control instead of only seeing the issue in the sidebar. Calculation and source-semantics regressions protect the boundary; screen-reader acceptance remains pending.

## Explicitly unauthenticated source-note support

Comparison, the on-screen memo and the PDF now label their shared count as user-linked source-note support rather than evidence status. Any nonzero count explicitly says that the notes are not authenticated, while an empty count remains visible. This prevents model completeness or a user-selected source label from being mistaken for document verification.

## Actionable deal-import recovery

Deal JSON imports now distinguish an oversized file from malformed UTF-8 and unsupported content while always confirming that the active deal remains unchanged. Only allowlisted local failure categories reach the status region; raw browser, filesystem and parser messages stay hidden. Pure regression cases protect both actionable copy and the generic privacy-preserving fallback.

## Scoped scenario-table headers

The scenario projection and year-one sensitivity tables now identify every column header explicitly, and both tables identify their first-column values as row headers. This gives assistive technology a stable relationship between each financial value and its year or earnings assumption inside the existing keyboard-scrollable regions. Source regression coverage protects these semantics; manual screen-reader acceptance remains pending.

## Unblocked PDF progress announcements

PDF preparation now marks only the action group as busy. The polite live progress message remains outside that busy subtree, so assistive technology does not have to defer “Preparing…” until the local render is already complete. Source regression coverage protects this relationship; manual screen-reader and browser-download acceptance remain pending.

## Extension focus after clearing

After a reviewed listing or unreadable saved draft is removed, the extension now returns keyboard focus to Capture this listing. Focus moves only after the serialized storage operation finishes and the Capture control is re-enabled, avoiding focus on a button inside newly hidden content. Simulated browser-API coverage exercises both successful removal paths; installed Chrome and Edge keyboard acceptance remains pending.

## Saved-library focus after deletion

After a local deal snapshot is successfully deleted, keyboard focus now moves from the removed Delete button to the persistent, labeled deal-library region. The region has the same visible high-contrast focus treatment as other programmatically focused workbench regions. A cancelled or failed deletion keeps the row and does not move focus; source regression coverage protects the success-only relationship, while manual browser and screen-reader acceptance remains pending.

## Listing-import focus transitions

The website listing importer now moves keyboard focus to the business-name review field after pasted, file or extension-fragment extraction; Back returns focus to the listing-text field; and a successful deal handoff returns focus to the persistent Import listing toggle. These transitions prevent focus from remaining on controls removed by conditional rendering. Source regression coverage protects all three destinations; manual browser and screen-reader acceptance remains pending.

## Listing-review error focus

When a reviewed website listing contains an ambiguous or invalid amount, Use reviewed numbers now moves keyboard focus to that exact field while preserving its relationship to the live alert. If every amount is blank, focus moves to the first amount field so the required correction is immediately actionable. The rejected review remains on-device and unapplied; source regression coverage protects both focus paths, while manual browser and screen-reader acceptance remains pending.

## Defensive model-setting boundary

The pure workbench engine now validates every active setting even when a caller bypasses the import and input boundaries. A zero or nonfinite coverage target cannot create a favorable screening component; invalid valuation settings cannot produce a valuation range; and invalid growth or projection length produces no scenario allocation. Nonfinite financial amounts propagate as unknown outputs while remaining explicit model issues. Independent regression cases cover each boundary, and the model documentation records the exact technical ranges.

## Invalid financial-value isolation

The calculation boundary now converts any financial amount outside its documented field range to unknown before deriving cash flow, coverage, valuation, scenario rows, score components or source-note support. The original invalid amount remains available only to produce its field-specific issue; it is never clamped or allowed to leak `Infinity` into a report. Regression cases cover nonfinite SDE and revenue across current outputs and projections. A real unpacked-Chromium acceptance attempt still failed before startup because this workspace denies Chromium's process-singleton socket, so installed Chrome/Edge remains a separate pending gate.

## Sensitivity-value isolation

Current results and the year-one sensitivity matrix now share one pure financial-value validation boundary. A finite but unsupported input can no longer make a sensitivity cell look favorable after the main screen has correctly rejected it; every affected distribution and coverage cell stays unknown. Regression coverage includes negative maintenance capex and SDE beyond the documented magnitude limit. This is local model validation; interactive browser and physical-device acceptance remain pending.

## Extension popup reflow

The extension popup no longer forces its four post-capture actions into one crowded row. Its body respects the available viewport, the header and action group wrap, financial metric columns can shrink without overflowing, and action buttons settle into two columns or one column as space narrows. A source-level regression protects these CSS boundaries. Installed Chrome/Edge testing and manual 200% text enlargement remain pending because this workspace still cannot start Chromium.

## Extension capture focus

After a successful page capture, the extension now moves keyboard focus from Capture this listing to the newly revealed Business name review field. Focus moves only after the serialized capture operation has finished and controls are enabled; a restricted-page failure keeps the existing review and does not move focus into changed content. Simulated browser-API coverage protects both paths. Installed Chrome/Edge keyboard and screen-reader acceptance remain pending.

## Assertive saved-deal import failures

Malformed, unreadable and oversized saved-deal files now produce a dedicated assertive error announcement instead of sharing the workbench's polite status region. The active deal remains unchanged, messages use the existing stable recovery wording, and a new import attempt clears the previous error before validation begins. Source-level accessibility coverage protects the alert relationship; manual browser and screen-reader acceptance remains pending.

## PDF renderer regression gate

The automated suite now executes the same React PDF memo component used by the browser, loads the distributed Liberation Sans font files and requires a nonempty PDF document with a valid file signature. This catches renderer, font-path and empty-output failures that compilation alone cannot detect. The fixture is the explicitly fictional Atlas sample; visual page-break inspection and a browser-downloaded PDF remain separate manual release gates.

## Long-name PDF heading integrity

The PDF keeps the exact saved deal name while reducing only the heading typography when the name is unusually long. Both page headers are now indivisible layout groups, so the memo renderer cannot split a heading from its identifying context at a page boundary. The real PDF engine renders the maximum supported 180-character name in regression coverage; visual inspection of a browser-downloaded memo remains pending.

## Explicit user-selected evidence labels

Every individual evidence status in the workspace, metric inspector, on-screen memo and PDF now says that it is user-selected and that the source is not authenticated. The source-note form gives the same qualification beside the selector, while stored status values and calculations remain unchanged. Pure regression coverage protects all supported labels; manual screen-reader and browser-downloaded PDF acceptance remain pending.

## Evidence-label narrow reflow

Long evidence disclosure badges can now shrink, wrap and break safely within the evidence row instead of widening the page at phone widths or enlarged text sizes. The rule is scoped to evidence labels so compact status pills elsewhere keep their existing treatment. Source regression coverage protects the reflow boundary; physical-phone and manual 200% text-enlargement acceptance remain pending.

## Guided next-action focus

Activating the sidebar's guided next action now moves keyboard focus to the selected workspace tab after the tab change, instead of leaving focus behind in the sidebar. Choosing an action for the already active tab still focuses that tab immediately. The behavior is scoped to guided navigation so listing-import and saved-library focus transitions retain their purpose; manual keyboard and screen-reader acceptance remain pending.

## Shared deal-name boundary

The editor, current snapshot validator, legacy review-copy migration and maximum-name PDF fixture now use one exported 180-character deal-name contract. Exact-boundary regression coverage accepts 180 characters and rejects 181 before persistence, while the contributor guide now distinguishes the current limit from older recovery input. This removes duplicated limits without changing stored names or substituting sample data.

## Deal-name readiness boundary

The pure workbench calculation now applies the same 180-character deal-name limit as the editor and snapshot validator. A direct in-memory caller that bypasses those boundaries cannot obtain a memo-ready result or screening index for a deal that the app cannot save. Regression coverage protects the issue text and score suppression, and the model documentation now includes the name limit in screen completeness. This is local integrity validation; manual browser and assistive-technology acceptance remains pending.

## Reporting-period readiness boundary

The editor, current snapshot and evidence validators, and pure workbench now share one exported 100-character reporting-period limit. A direct in-memory caller cannot obtain a memo-ready result or screening index for a period the app cannot save. Regression coverage protects the issue and score suppression, while the model documentation records the completeness boundary. This is local integrity validation; manual browser and assistive-technology acceptance remains pending.

## Extension manifest privacy gate

The extension build now validates its real manifest before packaging. It fails if permissions expand beyond activeTab, scripting and storage; if broad or optional host access, background execution, content scripts, external connections or web-accessible resources appear; or if the popup content policy permits network requests. Adversarial regression cases protect these boundaries. A native Chromium window launched in this environment, but its isolated browser session could not reach the host dev server and an unpacked install was not completed, so real Chrome/Edge capture acceptance remains pending.

## Extension ZIP round-trip gate

The custom dependency-free packager now reopens its generated ZIP before publishing it. The build verifies the exact ten-file allowlist, rejects traversal, absolute, duplicate and backslash paths, inflates every entry, validates local and central metadata, sizes and CRCs, and compares every byte with the staged extension. Regression cases cover valid round trips, unsafe names, duplicate entries, corrupted metadata and allowlist mismatch. This validates the downloadable artifact structure; installed Chrome/Edge interaction remains pending.

## Single unknown-preserving listing handoff

Removed an unused legacy listing-to-engine adapter that represented every missing claim as zero to satisfy an older all-numeric input shape. The live version-three handoff is now the only listing-to-deal conversion path: missing purchase, earnings, financing and operating values stay unknown, while an explicit reported zero remains zero. Regression coverage exercises both cases through the actual current importer. No saved data or current user flow is migrated by this cleanup.

## Evidence-form error announcements

Source-note validation and restore failures now use an assertive, atomic alert, while successful link, remove and restore messages remain polite status updates. The source location, excerpt and review-date controls reference the active error message so keyboard and screen-reader users can identify the affected form context. Source-level accessibility coverage protects the alert/status split and all three relationships; manual assistive-technology acceptance remains pending.

## Unreadable extension-draft recovery

An unreadable saved extension draft now produces an assertive alert instead of looking like a successful restore status. The visible Clear unreadable draft action references that alert until the corrupt state is replaced or removed, giving keyboard and screen-reader users the recovery context at the actionable control. Simulated browser-API coverage protects the error semantics and relationship; installed Chrome/Edge acceptance remains pending because the Chromium binary supplied to this workspace could not start.

## Ordered valuation-range imports

The version-three snapshot validator now enforces the same ordered valuation-multiple range as the pure calculation engine. An imported low multiple above its high multiple is rejected before persistence instead of entering the workspace as a permanently incomplete setting; equal bounds remain valid for a deliberate single-multiple illustration. Regression coverage protects both sides of the boundary, and the model continues to label every range as a user-entered educational assumption rather than an appraisal.

## Matched listing provenance imports

Listing JSON imports now reject a source excerpt when its matching normalized financial value is absent. The importer no longer silently discards that orphan excerpt or leaves the user unable to tell whether provenance survived the handoff. Missing financial values still remain unknown, and a supported value without an excerpt remains allowed as an unlinked claim. Regression coverage protects the inconsistent boundary; listing evidence remains user-reviewed and unauthenticated.

## Assertive PDF preparation failures

PDF preparation failures now use an assertive, atomic alert instead of the polite status semantics reserved for progress and successful completion. The Prepare PDF memo control references the same live message, so keyboard and screen-reader users can identify the failed action and its recovery guidance at the control. Source-level accessibility coverage protects the alert/status split and relationship; manual screen-reader and browser-download acceptance remain pending.

## Saved-deal import error relationship

The visible Import JSON action now references its active assertive error message after a saved-deal file fails validation or decoding. Keyboard and screen-reader users can return to the trigger with the failure and recovery guidance attached instead of finding an isolated page-level alert. A new selection still clears the prior error before reading; source-level accessibility coverage protects the relationship, while manual browser and screen-reader acceptance remains pending.

## Assertive JSON export recovery

Active-deal and saved-deal JSON export failures now use a dedicated assertive, atomic alert instead of the polite success-status channel. The exact export control that failed references the recovery message, while a successful retry clears the prior error before the browser download begins. Existing pure download-boundary tests continue to protect URL cleanup and stable on-device recovery wording; manual browser-download and screen-reader acceptance remain pending.

## Listing-import recovery relationships

Malformed extension handoff links, listing-file failures and cancelled deal replacements now associate their alert with the textarea, file-import action or reviewed-handoff action that can resolve the problem. A reviewed listing with no amounts marks and focuses the first amount field instead of moving focus without an invalid-state relationship. New text and file attempts clear obsolete messages; source-level accessibility coverage protects each target, while manual browser and screen-reader acceptance remains pending.

## Safe imported-deal download names

JSON backups and prepared PDFs now derive a bounded browser filename from the preserved deal ID instead of copying an imported ID directly into the download attribute. Path separators, control characters and reserved filename punctuation are removed without changing the stored ID, deal contents or round-trip behavior. Pure regression cases cover path-like, empty-after-cleaning and oversized IDs; real browser downloads remain a separate acceptance gate.

## Assertive local-storage recovery

IndexedDB load, save and delete failures now use assertive, atomic error semantics instead of the polite channel reserved for progress and successful completion. Each failed save or delete control references the recovery message, and a startup library failure associates the same guidance with the persistent library region. Storage contents and operation serialization are unchanged; source-level accessibility coverage protects the relationships, while manual browser and screen-reader acceptance remains pending.

## Reproducible extension acceptance fixture

A checked-in fictional listing page now gives installed Chrome or Edge testing a stable main region, a selected-text override and a decoy article card. The capture test reads that real fixture and confirms the expected four claims while excluding the decoy. The extension guide adds an observed-result checklist for capture, edit, save, restore, JSON export/import, selected-text priority, handoff and clear. Chromium was launched again in the available desktop environment on November 27, 2026, but exited before creating a window; no installed-browser acceptance is claimed from this run.

## Addressable saved-record boundary

The local saved-deal reader now excludes corrupted IndexedDB records whose ID is empty or only whitespace. Current imports already reject that state; applying the same rule while loading prevents an unaddressable record from reaching restore, export or delete controls while preserving recovery access for corrupted records that still have a usable ID. A pure regression case protects the boundary. Browser storage-failure and recovery acceptance remains pending.

## Named corrupt-record recovery

A corrupted local snapshot with a usable ID but an empty or whitespace-only name now receives the display label “Unreadable snapshot.” The fallback keeps its library row and repeated Export and Delete controls identifiable without altering the original recovery JSON; a successfully migrated legacy deal instead uses its validated migrated name. Pure regression coverage protects the label and original-name preservation. Manual browser and screen-reader recovery acceptance remains pending.

## Consistent funding-balance language

Deal inputs, the on-screen memo, comparison and exported PDF now use one pure formatter for sources versus uses. They report Balanced, a positive-dollar shortfall, positive-dollar excess sources, or Unknown instead of mixing “gap,” “difference,” “excess funds” and an unexplained negative sign. Tests cover all four states and the comparison fixture; the model documentation defines the sign convention. Browser and downloaded-PDF acceptance remain pending.

## Duplicate-property JSON rejection

The shared saved-deal and listing JSON boundary now rejects duplicate object properties before the browser parser can silently keep only the final value. Keys are compared after escape decoding, so a literal financial field and an equivalent Unicode-escaped spelling still conflict; matching keys in separate objects remain valid. The dependency-free preflight also rejects more than 100 nested containers with a controlled error. Adversarial regression coverage protects these cases. Real file-picker import acceptance remains pending.

## Discoverable table scrolling

Scenario projections, sensitivity results and saved-deal comparison now place a visible scroll instruction immediately before each independently scrollable table. Every focusable region references its instruction, including the arrow-key behavior, so the cue is available to narrow-screen, zoomed, keyboard and screen-reader users. The hint wraps at long text sizes and source regression coverage protects all three relationships. Manual phone, 200% zoom and assistive-technology acceptance remains pending.

## One-cent funding preflight

The retained legacy input-integrity preflight now flags a sources-versus-price difference of one cent in either direction, matching the active model's documented completeness boundary. Previously that secondary path tolerated differences below one dollar, so the same capital stack could receive conflicting structural results depending on the calculation entry point. Independent regression cases cover both a one-cent shortfall and one-cent excess; the historical formula documentation records the cent rounding and threshold. This consistency check does not establish that the proposed financing is available or lender-approved.

## Debt-free legacy coverage

The retained financial engine now reports debt coverage, its rating and its illustrative 1.25× comparison as not applicable when scheduled debt is zero. It no longer serializes infinity, assigns an automatic strong rating, sets a lender-minimum flag or awards favorable coverage points to a debt-free case. Sensitivity output, deterministic diligence insights and the disabled AI research packet preserve the same null state. Regression coverage protects the calculation, serialization, sensitivity, scoring and insight boundaries; the active workbench already used the honest “No scheduled debt” label. This is model consistency work, not lender underwriting or approval.

## Undefined legacy returns

The retained financial engine now keeps cash-on-cash return unavailable when buyer cash invested is zero and keeps simple payback unavailable when buyer cash is zero or modeled annual cash is nonpositive. It no longer substitutes a fake 0% return or serializes an infinite payback. The legacy score awards no return points for unavailable ratios, diligence insights distinguish an unfunded draft from a nonpositive-cash case, and the disabled research packet preserves null values. Regression coverage protects calculation, serialization, scoring, insight and packet behavior. The active workbench already enforced the same economic distinction; this closes the secondary path without claiming investment performance.

## Bounded legacy index

Every available retained-engine score component is now bounded to 0–100. Finite negative growth and earnings margins bottom out at zero instead of pulling the component or weighted total below its documented scale. Inapplicable coverage, return, payback, growth/margin or valuation remains null and suppresses the overall legacy index and rating rather than receiving automatic neutral or favorable points. Regression cases cover both extremes and unavailable inputs. The active workbench already suppressed its optional index for unresolved components; this aligns the secondary path without presenting the weights as validated predictors.

## Honest legacy valuation assumptions

The retained sector multiple ranges no longer cite broad provider names without an exact report, date, covered period or matching segment. Every range now identifies itself as a legacy educational assumption and explicitly says it is not verified market evidence. The valuation calculation, diligence insights and disabled research packet carry that limitation; falling within the illustration is a review item rather than positive evidence of market value. Regression coverage protects all ten labels and prevents the removed provider attributions from returning without supporting documentation. The active workbench continues to use user-entered educational multiples and does not present an appraisal.

## Strict imported timestamps

Saved-deal and listing timestamps now require a valid timezone-aware ISO instant rather than relying on JavaScript's permissive date parser. Informal dates, timezone-free values and impossible calendar dates are rejected before they can distort saved-library ordering or provenance; valid UTC and offset timestamps remain supported with the existing five-minute device-clock tolerance. Regression coverage protects leap dates, offset forms, future skew and both legacy and current deal-import boundaries. Real file-picker and device-clock acceptance remain pending.
