# CLAUDE.md

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
  storage/                  IndexedDB read/write, export/import (not yet built)
types/business.ts           the shared contract — BusinessInputs, FinancingInputs, AnalysisResult, etc.
docs/
  FORMULAS.md                every formula explained, must match code
  ARCHITECTURE.md             data flow and design rationale
```

**Data flow:** form input → typed `BusinessInputs`/`FinancingInputs` → `runAnalysis()` in `lib/calculations/index.ts` → typed `AnalysisResult` → rendered by presentational components → optionally persisted to IndexedDB → optionally exported to PDF/JSON.

## Current state (update this section as you go)

**Done:**
- Full calculation engine: valuation, financing/DSCR, returns/cash flow, scenario modeling, acquisition scoring — all pure, typed, unit-tested (35 tests passing).
- `runAnalysis()` orchestrator ties every module together into one `AnalysisResult`.
- Project scaffolding: Next.js 14 + TypeScript + Tailwind, Vitest configured with `@/` path alias, industry benchmark dataset with 10 industries.

**Not yet built (in priority order — this is the roadmap):**
1. `components/inputs/BusinessInfoForm.tsx` + `FinancingForm.tsx` — the actual data entry UI
2. `components/results/*` — dashboard showing valuation, DSCR, cash flow, ROI, payback, break-even chart (use Recharts)
3. `app/analysis/[id]/page.tsx` — wire the form + results together into one working single-business analysis flow (this completes the MVP)
4. `lib/storage/` — IndexedDB persistence (use the `idb` package, already in package.json) + JSON export/import
5. `components/scenarios/*` — scenario toggle/slider + comparison table/chart
6. `app/compare/page.tsx` — multi-business side-by-side comparison
7. `components/results/ScoreBreakdown.tsx` — visualize the acquisition score with its sub-score breakdown (transparency matters here — show the weights, not just the number)
8. PDF report export via `@react-pdf/renderer`
9. Polish: screenshots, demo GIF for README, deploy to Vercel

## Commands

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
