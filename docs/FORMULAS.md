# Historical engine formulas (not the current workbench)

The active version 3.0 model is documented in [WORKBENCH-MODEL.md](WORKBENCH-MODEL.md). The definitions below apply only to retained legacy library code and tests; the current interface and memo do not use its blended benchmark valuation, lender flag, or score.

This document is the source of truth for every calculation in the engine. If code and this doc ever disagree, that's a bug — file it. Every formula below links to its implementation.

## 1. Business Valuation

Three independent methods, then a blended estimate. Small-business valuation is inherently a range, not a point — presenting one number as "the" value would be dishonest.

| Method | Formula | Best for |
|---|---|---|
| SDE method | `SDE × industry SDE multiple` | Owner-operated businesses (most Main Street deals) |
| EBITDA method | `EBITDA × industry EBITDA multiple` | Businesses with a management layer already in place |
| Revenue method | `Annual Revenue × industry revenue multiple` | Sanity check when margins are unclear |

**Blended estimate:** `SDE method × 0.5 + EBITDA method × 0.3 + Revenue method × 0.2`
This 50/30/20 weighting is a retained educational assumption, not a sourced market convention.

The retained ranges in `lib/benchmarks/industryMultiples.ts` do not have an exact dated source in the repository. Each is labeled as a legacy educational assumption rather than attributed to a market-data provider. They are not comparables, market evidence or appraisals. A future sourced replacement must record the exact publication, date, covered period and relevant segment beside the number.

Implementation: `lib/calculations/valuation.ts` → `estimateValuation()`

## 2. Revenue Multiple (implied)

```
Implied Revenue Multiple = Purchase Price / Annual Revenue
```
The legacy engine compares this ratio with its educational range. That comparison does not establish a normal market range for the sector.

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
The legacy calculation rounds the difference to cents. Its structural preflight flags either a shortfall or excess of at least one cent, matching the active workbench completeness rule.

Implementation: `lib/calculations/financing.ts` → `calculateFundingGap()`

## 5. Legacy screening debt coverage

This retained engine divides reported SDE by annual scheduled debt service. The result is an educational screening ratio, not a lender standard or approval decision:
```
DSCR = Annual SDE / Annual Total Debt Service
```

| DSCR | Rating | Meaning |
|---|---|---|
| ≥ 1.25 | Strong | Clears the model's illustrative comparison threshold |
| 1.00 – 1.25 | Acceptable | Covers modeled debt with a limited cushion |
| 0.80 – 1.00 | Weak | Business barely/doesn't cover its own debt |
| < 0.80 | Critical | Cannot service this debt as structured |

With no scheduled debt, the ratio, rating and threshold comparison are not applicable. The calculation returns `null` rather than infinity, and the legacy score receives no favorable coverage points from that missing ratio.

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
The ratio is available only when total buyer cash invested is positive. Zero buyer cash returns `null`; it does not imply a 0% return or a fully financed transaction.

Implementation: `lib/calculations/returns.ts` → `calculateReturns()`

## 8. Payback Period

```
Payback Period (years) = Total Cash Invested / Annual Cash Flow After Debt
```
The period is available only when buyer cash invested and annual cash flow are both positive. Zero buyer cash or nonpositive cash flow returns `null`, with the reason determined from the inputs; neither state is represented as zero or infinity.

## 9. Break-Even Timeline

Projects cumulative cash flow month-by-month, starting at `−Total Cash Invested`, adding monthly cash flow after debt until the running total crosses zero (or a 10-year cap is hit).

Implementation: `lib/calculations/returns.ts` → `calculateBreakEvenSchedule()`

## 10. Scenario Modeling

Growth is applied compounding, year over year:
```
Revenue(year n) = Revenue(year 0) × (1 + revenue growth rate)ⁿ
Expenses(year n) = Expenses(year 0) × (1 + expense growth rate)ⁿ
Reconciliation = Entered SDE − (Revenue(year 0) − Expenses(year 0))
SDE(year n) = Revenue(year n) − Expenses(year n) + Reconciliation
Debt service(year n) = sum of scheduled payments in months 12(n−1)+1 through 12n
Pretax cash flow after debt(year n) = SDE(year n) − Debt service(year n)
```
The reconciliation is held constant in nominal dollars and displayed explicitly. It preserves the entered earnings baseline; it does not authenticate add-backs or resolve contradictory evidence. A nonzero value requires diligence. Revenue and expenses compound independently with annual cent rounding; the model does not assume a constant earnings margin.

Debt service uses the combined bank/seller amortization schedule, including partial years and the final payment adjustment, and becomes zero after both debts mature. It does not use the initial monthly payment multiplied by twelve forever. Supported horizons are 1–10 whole years; growth inputs are finite decimals from -1 to 10. These are technical bounds, not recommended assumptions.

Independent examples: $24,000 bank debt at zero interest for two years plus $12,000 seller debt at zero interest for one year gives annual payments of $24,000, $12,000, then $0. With flat SDE of $180,000 the corresponding cash flows are $156,000, $168,000, and $180,000. A baseline of $800,000 revenue, $620,000 expenses and $150,000 entered SDE has a -$30,000 reconciliation; zero-growth scenarios must retain $150,000 SDE.

These outputs remain simplified pretax screening cash flows. Buyer labor, replacement management, maintenance capex, working capital and taxes are not separately deducted in this milestone; they are outstanding model work, not assumed to be zero economic costs.

| Scenario | Default revenue growth | Default expense growth |
|---|---|---|
| Conservative | 0% | 2% |
| Expected | 5% | 3% |
| Aggressive | 15% | 5% |

These are starting points a user can override (the "custom" scenario).

Implementation: `lib/calculations/scenarios.ts` → `projectScenario()`, `projectAllStandardScenarios()`

## 11. Acquisition Score (0–100)

A weighted composite, fully transparent — every sub-score is independently computed and shown, not hidden behind a single number.

Each available component is bounded from 0 to 100. Negative growth or margin performance bottoms out at zero rather than pulling the component below its intended scale. An inapplicable coverage, return, payback, growth/margin or valuation component remains `null`; the overall legacy index and rating are then unavailable instead of substituting neutral or favorable points. These weights are educational conventions, not validated predictors of acquisition quality or financing approval.

| Factor | Weight | Rationale |
|---|---|---|
| DSCR | 30% | Modeled cushion above scheduled debt |
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
