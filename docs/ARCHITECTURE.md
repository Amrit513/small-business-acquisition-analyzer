# Architecture

## Design philosophy

Three principles drive every structural decision in this codebase:

1. **The calculation engine is framework-agnostic.** Everything in `lib/calculations` is plain TypeScript with zero React/Next.js dependency. This means it's independently testable, could be reused in a CLI or API, and — most importantly — keeps financial logic reviewable in one place instead of scattered across UI components.
2. **Privacy-first, client-side by default.** A business's financials (revenue, SDE, purchase price) are sensitive. The app runs entirely in the browser: inputs go into pure functions, results render locally, and persistence uses IndexedDB — nothing is sent to a server unless a future feature (e.g. shareable report links) explicitly opts into it.
3. **Transparency over black boxes.** The acquisition score, the valuation blend, the DSCR rating — every derived number shows its inputs and reasoning rather than presenting an opaque verdict. This is both an ethical choice (this tool influences real financial decisions) and a code-quality one (transparent logic is testable logic).

## Data flow

```
┌─────────────────┐
│   User Input     │  BusinessInfoForm, FinancingForm (components/inputs)
└────────┬─────────┘
         │  typed as BusinessInputs / FinancingInputs (types/business.ts)
         ▼
┌─────────────────────────┐
│   runAnalysis()          │  lib/calculations/index.ts
│   (the orchestrator)     │  calls every calculation module in order:
│                          │  valuation → financing/DSCR → cash flow →
│                          │  returns → break-even → scoring
└────────┬─────────────────┘
         │  returns a typed AnalysisResult
         ▼
┌─────────────────────────┐
│   Results components     │  components/results/*
│   (presentational only)  │  ValuationCard, DSCRGauge, CashFlowChart,
│                          │  ScoreBreakdown — render data, do no math
└────────┬─────────────────┘
         │
         ├──► lib/storage (IndexedDB)      — save/load analyses locally
         └──► PDF export (@react-pdf/renderer) — investor-style report
```

## Why a single orchestrator function (`runAnalysis`)

Every `AnalysisResult` in the app is built by calling exactly one function: `runAnalysis(businessName, inputs, financing)` in `lib/calculations/index.ts`. This guarantees:

- No UI code can accidentally skip a calculation step or build a partial result.
- Adding a new derived metric means updating one function and its return type, and every caller gets it automatically.
- Testing the "full pipeline" behavior (not just individual functions) means testing one function.

If a component needs a single number (e.g. just DSCR for a quick preview), it's fine to call the underlying function directly (`calculateDSCR`) — but any component building a full analysis view should go through `runAnalysis`.

## Why TypeScript strict mode + shared types

`types/business.ts` is the contract every part of the app agrees on: `BusinessInputs`, `FinancingInputs`, `AnalysisResult`, and everything nested inside them (`ValuationEstimate`, `DSCRResult`, `AcquisitionScoreBreakdown`, etc.). Strict mode plus `noUncheckedIndexedAccess` catches an entire category of "assumed a field existed" bugs at compile time rather than in a user's browser — important for a tool making financial claims.

## Why the calculation engine is split into five modules instead of one file

`valuation.ts`, `financing.ts`, `returns.ts`, `scenarios.ts`, `scoring.ts` each own one financial concern and can be tested, reviewed, and reasoned about independently. `scoring.ts`, for example, depends on outputs from the other four — that dependency is explicit in its function signature (`calculateAcquisitionScore(inputs, valuation, dscrResult, returns)`), not implicit through shared mutable state.

## Extending the engine

Adding a new calculated metric:
1. Add the field to the relevant type in `types/business.ts`.
2. Implement it as a pure function in the appropriate `lib/calculations/*.ts` file (or a new file if it's a new concern).
3. Write tests in the matching `__tests__` file first or alongside.
4. Wire it into `runAnalysis()` in `lib/calculations/index.ts` if it belongs in the standard result.
5. Document the formula in `docs/FORMULAS.md`.
6. Only then build the UI to display it.

This order (types → pure function → test → orchestrator → docs → UI) is intentional — it keeps the engine correct and documented before any UI depends on it.
