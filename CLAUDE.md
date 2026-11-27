# CLAUDE.md

The active workbench uses lib/calculations/workbench.ts and docs/WORKBENCH-MODEL.md. Legacy financial code remains for historical tests; its old lender flags and benchmark blends do not drive the current interface. Cloud AI remains disabled.

This file gives Claude Code (or any contributor) the context needed to work on this project correctly. Read this before making changes.

## What this project is

**Small Business Acquisition Analyzer** — an open-source tool that simulates the financial due-diligence process an entrepreneur or investor performs before buying a small business. It's a portfolio project (for a college application / resume / GitHub profile) that's also meant to become genuinely useful to real people evaluating real acquisitions. Both goals matter: it needs to look professional in a code review, and it needs to give correct financial answers.

**Owner context:** built by a high school student learning software engineering, finance, and entrepreneurship simultaneously. Treat this as a real production codebase, not a toy — but explain *why* behind non-trivial decisions in commit messages and comments, since part of the goal is learning, not just shipping.

## Non-negotiable rules

1. **Never put calculation logic in a component.** All math lives in `lib/calculations/*.ts` as pure, exported, unit-tested functions. Components only call these functions and render the result. If you're about to write `revenue * multiple` inside a `.tsx` file, stop — it belongs in `lib/calculations`.
2. **Every calculation function needs a test.** `lib/calculations/__tests__/` mirrors `lib/calculations/` one-to-one. Run `npm test` before considering any calculation change done. Currently: 35/35 tests passing across valuation, financing, returns, scenarios, and scoring — keep it green.
3. **No invented financial data.** Industry benchmark multiples (`lib/benchmarks/industryMultiples.ts`) must cite a source in the `source` field. If you don't have a sourced number, mark it clearly as an estimate rather than presenting it as authoritative — this tool's credibility depends on not pretending precision it doesn't have.
4. **Formulas must match `docs/FORMULAS.md` exactly.** If you change a formula or a scoring weight in code, update that doc in the same commit. They must never drift apart — a contributor should be able to read the doc and verify the code does what it says.
5. **TypeScript strict mode stays on.** Don't add `any` to get past a type error — fix the type. `noUncheckedIndexedAccess` is on for a reason (array access safety); don't turn it off.
6. **Privacy-first architecture.** This tool analyzes potentially sensitive business financials. Default behavior is fully client-side (IndexedDB, no server round-trip for analysis data). Don't add a backend/database for analysis data without discussing it first — that's an intentional design decision, not an oversight.

## Architecture quick reference

```
app/                      Next.js App Router pages (UI only, no calculation logic)
components/
  inputs/                 Forms: BusinessInfoForm, FinancingForm
  results/                 ValuationCard, DSCRGauge, CashFlowChart, ScoreBreakdown
  scenarios/               ScenarioSlider, ScenarioComparisonTable
  ui/                      shadcn/ui primitives
lib/
  calculations/            THE ENGINE. Framework-agnostic. Pure functions only.
    valuation.ts           SDE/EBITDA/revenue valuation methods
    financing.ts           loan amortization, DSCR
    returns.ts              cash flow, ROI, payback period, break-even
    scenarios.ts             growth projections (conservative/expected/aggressive)
    scoring.ts               weighted acquisition score (0-100)
    index.ts                 runAnalysis() — the single orchestrator, wires everything together
    __tests__/                one test file per module above
  benchmarks/               industry multiple datasets (sourced)
  storage/                  IndexedDB read/write, validated versioned JSON export/import
types/business.ts           the shared contract — BusinessInputs, FinancingInputs, AnalysisResult, etc.
docs/
  FORMULAS.md                every formula explained, must match code
  ARCHITECTURE.md             data flow and design rationale
```

**Data flow:** form input → typed `BusinessInputs`/`FinancingInputs` → `runAnalysis()` in `lib/calculations/index.ts` → typed `AnalysisResult` → rendered by presentational components → optionally persisted to IndexedDB → optionally exported to PDF/JSON.

## Current state (update this section as you go)

**Release direction:** follow `docs/REDESIGN-RELEASE.md` for the owner's master-spec milestones and evidence gates. Preserve production until the redesign and required verification are ready. Do not enable cloud AI.

**Done:**
- Scenario projections preserve entered SDE with an explicit fixed-dollar reconciliation and stop debt service at bank/seller maturities. Reconciliation and scheduled debt are visible in the scenario workspace; labor/capex/working-capital exclusions remain explicit.
- Manifest V3 Chrome/Edge extension: click-only listing capture, editable review, on-device ratios, local draft, JSON export, and fragment handoff to the website.
- Shared conservative USD listing extractor with ambiguity and missing-value handling; saved source metadata and explicit remaining-assumptions review.
- Installable web app manifest, mobile-friendly input sizing, and `/install` instructions/download route.
- Extension packaging is reproducible with `npm run build:extension`; `npm run build` runs it automatically.
- Saved-deal JSON import validates nested fields and metadata before persistence, caps file reads at 256 KiB, and bounds amortization work. Valid version-one/two exports preserve financial values and source evidence.
- Workspace tabs use one keyboard tab stop plus Arrow/Home/End navigation, skipping the locked memo. The defect was reproduced in the public desktop app before the local fix.
- September 5 checkpoint: 128 unit tests pass; TypeScript, extension packaging and Next.js production build verified locally. Phone and extension acceptance on physical devices still pending.
- Full calculation engine: valuation, financing/DSCR, returns/cash flow, scenario modeling, acquisition scoring, funding-gap validation, and explainable diligence insights — all pure, typed, unit-tested (40 tests passing).
- `runAnalysis()` orchestrator ties every module together into one `AnalysisResult`.
- Project scaffolding: Next.js 14 + TypeScript + Tailwind, Vitest configured with `@/` path alias, industry benchmark dataset with 10 industries.
- Responsive acquisition workspace with business and financing inputs, live deal scoring, and sample-data reset.
- Investment memo dashboard with valuation, DSCR, cash-on-cash ROI, payback period, score transparency, valuation cross-checks, and five-year scenario charts/tables.
- Private IndexedDB deal snapshots plus versioned JSON import/export.
- Seller-financing inputs with combined debt-service modeling and a sources-and-uses funding check.
- Side-by-side comparison workspace for ranking up to four saved acquisitions by score, ROI, DSCR, cash flow, valuation, and payback.
- Investor-style PDF memo export, custom one-to-ten-year scenarios, an earnings/rate sensitivity matrix, and deterministic due-diligence priorities with next-step guidance.
- AI research modules and regression fixtures preserved. Cloud AI is disabled for this release; the route returns 503 with no network call. See `docs/AI_METHODOLOGY.md`.
- Unit-tested Gemini transport boundary covering structured request configuration, compact evidence transmission, and defensive response extraction.
- Initial accessibility pass: skip navigation, semantic tab panels, screen-reader field help, keyboard focus visibility, polite status announcements, and reduced-motion support.
- Deterministic AI regression rubric with scenario-specific verdict gates, confidence limits, evidence-citation checks, and CI-ready fixtures.
- Private field-level evidence provenance for key financial claims, persisted through saved deals and versioned JSON exports and included in the AI evidence packet.
- Evidence-quality appendix in the PDF investment memo, with explicit verification flags and a user-selected-label disclaimer.
- Deterministic input-integrity preflight that blocks unusable core inputs and flags unusual earnings relationships or mismatched funding before memo and AI interpretation.

**Not yet built (in priority order — this is the roadmap):**
1. Browser acceptance testing of the extension and phone installation on actual devices
2. Browser acceptance of saved-deal JSON import/error recovery
3. Extend listing extraction using representative, permitted fixtures; preserve unknown values
4. PDF document extraction with evidence review
5. Offline web app support; cloud AI requires a separately eligible operator

## Commands

### Saved-deal import limits

Imports reject malformed data rather than coercing strings or inventing missing numbers. JSON object properties must be unique after escape decoding, and nesting is limited to 100 containers. Technical supported bounds: 256 KiB UTF-8, monetary magnitudes up to $1 trillion (negative SDE/EBITDA allowed), growth from -100% to 1000%, nonnegative integer employee counts up to 10 million, interest rates from 0% to 100%, and loan terms from 0 to 100 years (at most 1,200 schedule rows per loan). These are parser/resource limits, not underwriting recommendations. Zero or economically inconsistent inputs still go through the existing financial preflight. IDs must be nonblank and at most 256 characters; current workspace names are limited to 180 characters. Legacy recovery accepts an older name up to 1,000 characters and truncates its review copy to the current boundary. Timestamps must be parseable. Listing source objects use the separate listing validator. No cloud call is involved.

```bash
npm run dev              # local dev server
npm test                 # run the calculation engine test suite (must stay green)
npm run test:coverage    # coverage report (target: 85%+ on lib/calculations)
npm run build            # production build check
npm run lint              # ESLint
```

## Working style preferences

- Prefer small, reviewable commits over large ones — one logical change per commit, with a message that explains *why*, not just *what*.
- When adding a new calculation, write the test alongside it, not after — this codebase's credibility rests on the engine being verifiably correct.
- When touching UI, check `docs/ARCHITECTURE.md` for the data flow before introducing a new pattern.
- This is a learning project as much as a shipping project — if you (Claude Code) make a nontrivial design choice, briefly explain the tradeoff in the PR description or commit message so the owner can learn from it, not just accept a diff.
