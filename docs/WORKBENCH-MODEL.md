# Acquisition Lens model 3.0

This educational asset-purchase screen models annual USD figures for one operating business. The price is the assumed price of its operating assets, excluding seller cash and pre-existing debt. It does not reconcile share purchases, taxes, inventory adjustments, balloon notes, exit proceeds, IRR or a lender's underwriting standard. Sample figures describe a fictional business. Sources are claims or user annotations; the software cannot authenticate them.

| Item | Calculation and scope |
| --- | --- |
| Funding | Sources = buyer cash + bank note + seller note. Uses = purchase price + closing costs + initial working capital. Any difference of at least a cent prevents a complete screen. |
| Earnings bridge | Operating earnings = revenue minus expenses, including seller compensation in expenses if added back. Bridge = entered SDE minus operating earnings. Describe add-backs and differences. Seller pay already embedded in SDE is never added again. |
| Debt | Monthly fixed fully amortizing loans; annual nominal rate divided by 12. Round each payment, principal and interest to cents; reconcile the final balance. A zero-interest loan repays straight-line principal. Each year uses only payments scheduled in that year. |
| Cash to equity | SDE minus buyer compensation, incremental replacement labor, maintenance capex, increase in annual working capital and scheduled debt service. A working capital release is negative. Upfront working capital belongs in uses, not in the annual increase. Taxes excluded. |
| Screening coverage | (SDE minus buyer compensation and incremental replacement labor) / scheduled debt service. Before capex, working capital and taxes. Zero debt has no coverage ratio. Editable comparison target, not a lending rule. |
| Cash-on-cash / payback | Annual pretax cash to equity divided by positive buyer cash invested. Payback reverses that ratio only when both are positive. Zero equity never implies a zero return or immediate payback. |
| Scenario | Year t revenue = R × (1 + gR)^t; expense = E × (1 + gE)^t. SDE = projected revenue minus expense plus the original dollar bridge. Fixed nominal nondebt adjustments; use the actual two payment schedules. Year 1 applies the first change. The baseline keeps operating assumptions flat with the same maturing debt. |
| Sensitivity | 80%, 90%, 100%, 110% of reported SDE crossed with bank APR minus 2, unchanged or plus 2 percentage points (bounded 0–100%). With no bank loan only one rate case is needed. No probabilities. |
| Valuation | Positive SDE × user-editable low/high multiples. Default 2–4× is an educational illustration, not an industry benchmark. No appraisal, blended appraisal or enterprise-to-equity conversion. |
| Optional screening index | Clamp each component to 0–100. Weights: 30% × (70 × coverage / user's target); 25% × (100 × cash-on-cash / .35); 20% × (100 × (10 − payback) / 7); 15% × (100 × SDE margin / .20); 10% × (70 × midpoint indication / price). Round the weighted sum. No index for an unresolved screen or an inapplicable component. These illustrative weights are not validated predictors. Evidence quality is displayed separately. |

## Two hand checks

Atlas: $425,000 + $18,000 + $20,000 = $463,000 of uses. $123,000 buyer cash + $340,000 bank debt = $463,000. A ten-year, 9.5% loan pays $4,399.52 monthly in year one. $170,000 SDE − $60,000 buyer pay − $10,000 capex − $5,000 annual working capital − $52,794.24 debt = **$42,205.76** pretax distribution. Coverage = $110,000 / $52,794.24 = **2.08×**. A 10% revenue decline and 3% expense rise produce $105,100 SDE and **−$22,694.24** distribution.

Maturities: a $12,000 two-year zero-interest note pays $500 monthly. A $3,000 six-month seller note adds $500 for only six months. Combined model debt in years 1, 2 and 3 is $9,000, $6,000 and $0. Coverage in year 3 is inapplicable.

## Screen completeness

A memo-ready screen requires a nonblank deal name and annual reporting period, every required transaction and operating input, reconciled sources and uses, complete terms for each funded note, ordered valuation assumptions, an explained earnings bridge when applicable, and the user's review acknowledgement. These checks establish model completeness only; they do not authenticate evidence or make an acquisition decision-ready.
