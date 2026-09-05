# Financial Formulas Reference

This document is the source of truth for every calculation in the engine. If code and this doc ever disagree, that's a bug — file it. Every formula below links to its implementation.

## 1. Business Valuation

Three independent methods, then a blended estimate. Small-business valuation is inherently a range, not a point — presenting one number as "the" value would be dishonest.

| Method | Formula | Best for |
|---|---|---|
| SDE method | `SDE × industry SDE multiple` | Owner-operated businesses (most Main Street deals) |
| EBITDA method | `EBITDA × industry EBITDA multiple` | Businesses with a management layer already in place |
| Revenue method | `Annual Revenue × industry revenue multiple` | Sanity check when margins are unclear |

**Blended estimate:** `SDE method × 0.5 + EBITDA method × 0.3 + Revenue method × 0.2`
SDE is weighted heaviest because it's the standard method for the size of business this tool targets.

Industry multiples come from `lib/benchmarks/industryMultiples.ts`, each with a cited source (BizBuySell Insight Reports, IBBA Market Pulse Surveys, or sector-specific marketplace data). These are directional ranges, not appraisals — a real acquisition should always get a professional valuation.

Implementation: `lib/calculations/valuation.ts` → `estimateValuation()`

## 2. Revenue Multiple (implied)

```
Implied Revenue Multiple = Purchase Price / Annual Revenue
```
Compare against the industry benchmark range to sanity-check whether the asking price is in a normal range for the sector.

## 3. Profit Margin

```
Profit Margin = SDE / Annual Revenue
```
Implementation: `lib/calculations/valuation.ts` → `calculateProfitMargin()`

## 4. Loan Payment (Amortization)

Standard fixed-rate amortization formula:
```
r = annual interest rate / 12
n = loan term in years × 12
Monthly Payment = Principal × [ r(1+r)ⁿ ] / [ (1+r)ⁿ − 1 ]
```
Special case: at 0% interest, payment is simply `Principal / n` (straight-line), since the formula above divides by zero at r = 0.

Implementation: `lib/calculations/financing.ts` → `calculateMonthlyLoanPayment()`, `buildAmortizationSchedule()`

If seller financing is present, it's calculated as a second, independent amortizing loan and combined with the primary loan (`summarizeLoan()`).

The funding check verifies that the proposed sources match the purchase price:
```
Funding Gap = Purchase Price − Down Payment − Primary Loan − Seller Note
```
A positive result is still unfunded; a negative result means the proposed sources exceed the purchase price.

Implementation: `lib/calculations/financing.ts` → `calculateFundingGap()`

## 5. Debt Service Coverage Ratio (DSCR)

The single most important number to a lender:
```
DSCR = Annual SDE / Annual Total Debt Service
```

| DSCR | Rating | Meaning |
|---|---|---|
| ≥ 1.25 | Strong | Meets typical SBA lender minimums |
| 1.00 – 1.25 | Acceptable | Thin coverage; some lenders may still decline |
| 0.80 – 1.00 | Weak | Business barely/doesn't cover its own debt |
| < 0.80 | Critical | Cannot service this debt as structured |

Implementation: `lib/calculations/financing.ts` → `calculateDSCR()`

## 6. Cash Flow After Debt

```
Annual Cash Flow After Debt = SDE − Annual Debt Service
Monthly Cash Flow After Debt = Annual Cash Flow After Debt / 12
```
This assumes the new owner draws roughly the same compensation the seller did (already embedded in SDE by definition). The `ownerSalary` field lets a UI model paying the new owner a different amount.

Implementation: `lib/calculations/returns.ts` → `calculateCashFlow()`

## 7. Return on Investment (Cash-on-Cash)

```
Total Cash Invested = Down Payment + Closing Costs
Cash-on-Cash ROI = Annual Cash Flow After Debt / Total Cash Invested
```
This is the metric buyers use to compare an acquisition against alternatives (index funds, other deals, real estate).

Implementation: `lib/calculations/returns.ts` → `calculateReturns()`

## 8. Payback Period

```
Payback Period (years) = Total Cash Invested / Annual Cash Flow After Debt
```
Returns `Infinity` if cash flow after debt is zero or negative — the investment never pays back under current assumptions.

## 9. Break-Even Timeline

Projects cumulative cash flow month-by-month, starting at `−Total Cash Invested`, adding monthly cash flow after debt until the running total crosses zero (or a 10-year cap is hit).

Implementation: `lib/calculations/returns.ts` → `calculateBreakEvenSchedule()`

## 10. Scenario Modeling

Growth is applied compounding, year over year:
```
Revenue(year n) = Revenue(year 0) × (1 + revenue growth rate)ⁿ
Expenses(year n) = Expenses(year 0) × (1 + expense growth rate)ⁿ
SDE(year n) = Revenue(year n) − Expenses(year n)
```
Debt service is held constant (fixed-rate loans don't change with performance), so an improved SDE flows directly through to improved cash flow.

| Scenario | Default revenue growth | Default expense growth |
|---|---|---|
| Conservative | 0% | 2% |
| Expected | 5% | 3% |
| Aggressive | 15% | 5% |

These are starting points a user can override (the "custom" scenario).

Implementation: `lib/calculations/scenarios.ts` → `projectScenario()`, `projectAllStandardScenarios()`

## 11. Acquisition Score (0–100)

A weighted composite, fully transparent — every sub-score is independently computed and shown, not hidden behind a single number.

| Factor | Weight | Rationale |
|---|---|---|
| DSCR | 30% | Can this deal get financed / survive its own debt |
| Cash-on-cash ROI | 25% | Is the return competitive with alternatives |
| Payback period | 20% | Faster payback = lower risk |
| Revenue growth + profit margin | 15% | Quality of the underlying business |
| Valuation vs. industry benchmark | 10% | Is the buyer overpaying relative to comps |

```
Total Score = DSCR score × 0.30
            + ROI score × 0.25
            + Payback score × 0.20
            + Growth/margin score × 0.15
            + Valuation score × 0.10
```

| Score | Rating |
|---|---|
| ≥ 85 | Excellent |
| 70–84 | Good |
| 50–69 | Fair |
| 30–49 | Risky |
| < 30 | Poor |

Implementation: `lib/calculations/scoring.ts` → `calculateAcquisitionScore()`, with each sub-score in its own named function (`scoreDSCR`, `scoreROI`, `scorePaybackPeriod`, `scoreGrowthAndMargin`, `scoreValuation`) so the reasoning behind each is independently readable and testable.

---

**A note on precision:** every number this tool produces is an estimate built from the inputs a user provides and general market benchmark data. It is not a substitute for a professional valuation, accountant, attorney, or lender's own underwriting. The goal is to help someone reason clearly about a potential deal — not to replace due diligence.

## Listing screening ratios

The extension reports asking price / SDE when both figures are present and SDE is positive. SDE margin is SDE / annual revenue when both are present and revenue is positive. Missing, nonfinite or negative inputs produce no ratio. These describe reported listing claims; they are not valuations or investment recommendations. Implementation: `lib/calculations/listingScreen.ts`.
