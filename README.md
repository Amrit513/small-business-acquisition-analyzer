# Small Business Acquisition Analyzer

An open-source tool that simulates the financial due-diligence process an entrepreneur or investor performs before acquiring a small business — valuation, financing, debt coverage, returns, scenario modeling, and a transparent acquisition score, all in one place.

> **Status:** the calculation engine is complete and fully unit-tested (35/35 tests passing). The UI (input forms, results dashboard) is the current build phase — see the roadmap below.

## Why this exists

Most "business valuation calculators" online are single-input, single-output black boxes. Real acquisition analysis isn't like that — it's a chain of interconnected numbers (valuation → financing → debt coverage → cash flow → returns) where changing one assumption ripples through everything else. This tool is built to reflect that: every calculation is transparent, sourced, and testable, and scenario modeling lets you see how a deal holds up under different growth assumptions rather than trusting a single static number.

## Who it's for

- Entrepreneurs evaluating whether to buy an existing business instead of starting one
- Small business buyers doing early-stage due diligence
- Investors screening potential acquisitions
- Students learning how business acquisition analysis actually works

## What it calculates

| Category | Metrics |
|---|---|
| **Valuation** | SDE, EBITDA, and revenue-multiple estimates, blended into one figure, benchmarked against sourced industry multiples |
| **Financing** | Loan amortization schedule, monthly payment, seller financing support |
| **Risk** | Debt Service Coverage Ratio (DSCR) — the metric lenders actually underwrite against |
| **Returns** | Cash flow after debt, cash-on-cash ROI, payback period, break-even timeline |
| **Scenarios** | Conservative / expected / aggressive growth projections, or fully custom assumptions |
| **Scoring** | A transparent, weighted 0–100 acquisition score with a visible breakdown of every factor |

See [`docs/FORMULAS.md`](docs/FORMULAS.md) for the exact math behind every number, with sources cited.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** for a clean, professional interface
- **Recharts** for cash flow and break-even visualizations
- **Vitest** for testing the calculation engine
- **IndexedDB** for local, private, client-side persistence — no server, no account, your numbers stay in your browser
- **@react-pdf/renderer** for investor-style PDF report export

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design rationale.

## Getting started

```bash
git clone https://github.com/<your-username>/small-business-acquisition-analyzer.git
cd small-business-acquisition-analyzer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the calculation engine's test suite:
```bash
npm test
```

## Project structure

```
lib/calculations/    the engine — pure, typed, unit-tested financial logic
lib/benchmarks/      sourced industry valuation multiple data
types/business.ts    shared type contracts (BusinessInputs, AnalysisResult, etc.)
components/          UI, organized by inputs / results / scenarios
docs/                FORMULAS.md and ARCHITECTURE.md
```

Full breakdown in [`CLAUDE.md`](CLAUDE.md).

## Example analysis

A $450,000 acquisition of a service business with $180,000 SDE, financed with $100,000 down and a $350,000 SBA-style loan at 9.5% over 10 years:

- **Blended valuation estimate:** ~$430,000 (vs. $450,000 asking — paying close to fair value)
- **Monthly loan payment:** ~$4,530
- **DSCR:** ~1.29 → rated *strong*, meets typical SBA lender minimums
- **Monthly cash flow after debt:** ~$10,470
- **Cash-on-cash ROI:** ~34%
- **Payback period:** ~2.9 years
- **Acquisition score:** in the *good–excellent* range, driven mainly by a strong DSCR and fast payback

(Numbers illustrative — run your own inputs once the UI ships, or call `runAnalysis()` directly from `lib/calculations`.)

## Roadmap

- [x] Calculation engine: valuation, financing/DSCR, returns, scenarios, scoring
- [ ] Input forms and results dashboard (MVP)
- [ ] IndexedDB persistence + JSON export/import
- [ ] Scenario comparison UI
- [ ] Multi-business comparison view
- [ ] PDF investor-style report export
- [ ] Deployed demo on Vercel

## Contributing

Contributions welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md). Good first issues include adding sourced industry benchmarks and building out results components.

## Disclaimer

This tool produces estimates based on user-provided inputs and general market benchmark data. It is not a substitute for a professional business valuation, accountant, attorney, or a lender's own underwriting. Always do full due diligence before acquiring a business.

## License

MIT — see [`LICENSE`](LICENSE).
