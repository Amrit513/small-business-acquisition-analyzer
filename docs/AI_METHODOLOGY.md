# Release availability

Cloud AI is disabled in the September 5 release. The API route returns 503 and forwards no financial data, even if a previous server key remains configured. The prompt, structured-output parsing and regression fixtures below remain as development research; they are not a live feature. Google's Gemini API age requirements are documented at https://ai.google.dev/gemini-api/terms. Do not enable access through a parent's credentials for a minor.

# AI Underwriting Methodology

The AI review is a second-pass interpretation layer. It does not calculate valuation, debt service, returns, scenarios, or the acquisition score. Those outputs come from the deterministic, unit-tested engine in `lib/calculations`.

## Accuracy controls

1. **Calculation isolation:** the language model receives completed engine outputs and cannot replace the formulas.
2. **Structured output:** the server requires a strict JSON Schema so the response always uses known fields and approved verdict values.
3. **No invented data:** the system instruction prohibits invented financials, market facts, documents, customers, or certainty.
4. **Evidence boundaries:** all user inputs are treated as unverified until supported by source documents.
5. **Missing-data disclosure:** every review must identify the evidence still needed before an acquisition decision.
6. **Human review:** output is screening analysis, not legal, tax, accounting, lending, appraisal, or investment advice.
7. **Explicit transmission:** financial data is sent to the configured model only after the user selects **Analyze this deal**.
8. **Server-side credentials:** `GEMINI_API_KEY` remains on the server and is never included in browser code.
9. **Compact evidence packet:** the model receives decision metrics and downside checks, not the full monthly amortization schedule.
10. **Prompt-injection boundary:** user-controlled names are delimited as data and cannot redefine the analyst's instructions.
11. **Runtime validation:** model output is validated again after Structured Outputs; malformed responses are rejected.
12. **Confidence cap:** until source-document ingestion exists, the application prevents a `high` evidence-confidence label.
13. **Regression grading:** captured reviews can be scored in CI against scenario-specific verdict, confidence, missing-data, risk-evidence, and caveat requirements with `npm run test:ai-evals`.
14. **Field provenance:** the evidence packet identifies whether each key financial claim is unverified, listing-derived, seller-provided, or document-supported. These labels are user-selected and never presented as independent authentication.

## Evaluation rubric

`lib/ai/evaluation.ts` derives allowed verdicts from the deterministic base case and the 20% earnings / 200-basis-point rate shock. A review receives five equally weighted checks:

1. Verdict is compatible with modeled debt coverage and downside resilience.
2. Confidence does not exceed the evidence available to the application.
3. At least three missing evidence items are identified.
4. Every material risk cites a numeric packet value or says the evidence was not provided.
5. Caveats explicitly distinguish modeled or unverified inputs from verified facts.

These tests measure instruction-following and evidence discipline. They do not claim that an AI can predict acquisition outcomes.

## Decision structure

The AI returns one of four screening verdicts:

- `advance`
- `advance_with_conditions`
- `pause`
- `decline`

It also returns confidence, strengths, evidence-backed risks, missing data, seller questions, negotiation options, and caveats. Confidence represents completeness of the submitted information, not certainty that the business will perform as modeled.

## Source hierarchy

The product should prioritize evidence in this order:

1. Filed tax returns and audited or accountant-prepared financial statements
2. Bank statements, merchant-processor exports, payroll records, and general-ledger detail
3. Customer, contract, churn, concentration, accounts receivable/payable, inventory, and working-capital records
4. Seller-provided summaries and marketplace listing claims
5. Buyer assumptions and scenario inputs

## External guidance

- Gemini structured output: <https://ai.google.dev/gemini-api/docs/structured-output>
- Gemini API pricing and free-tier data-use terms: <https://ai.google.dev/gemini-api/docs/pricing>
- SBA 7(a) program and ability-to-repay overview: <https://www.sba.gov/loans/7a-loans/>
- SBA SOP 50 10 lender requirements: <https://www.sba.gov/document/sop-50-10-lender-development-company-loan-programs>

No software output replaces qualified professional due diligence or an independent valuation.
