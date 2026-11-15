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
