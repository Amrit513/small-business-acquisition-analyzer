import { describe, expect, it } from "vitest";
import { extractListing, listingFragment, listingFromFragment, listingToInputs, parseListingAmount, parseListingDraft, safeListingUrl } from "../listing";

describe("listing import boundary", () => {
  it("extracts labeled USD figures and keeps source snippets", () => {
    const draft = extractListing("Asking Price: $425,000\nAnnual Revenue\n$520K\nCash Flow (SDE): $170,000\nEBITDA: USD 125000", "Atlas", "https://example.com/business?token=secret#x");
    expect(draft.values).toEqual({ purchasePrice: 425000, annualRevenue: 520000, sde: 170000, ebitda: 125000 });
    expect(draft.url).toBe("https://example.com/business");
    expect(draft.quotes.annualRevenue).toContain("$520K");
  });
  it.each(["$1M-$2M", "$10,000 / month", "€400000", "CAD 100000", "3.5x", "-1000", "1,23", "Undisclosed", "$500,000+", "£20K", "1e8"])("leaves unsupported amount %s unknown", raw => expect(parseListingAmount(raw)).toBeUndefined());
  it("does not convert ambiguous cash flow to SDE or select one of conflicting revenue figures", () => {
    const draft = extractListing("Cash Flow: $100,000\nRevenue: $300,000\nRevenue: $500,000");
    expect(draft.values).toEqual({});
    expect(draft.warnings.join(" ")).toContain("Cash flow");
  });
  it("does not hide an uncertain amount behind another matching label", () => {
    expect(extractListing("Asking Price: $500K\nAsking Price: $400K-$600K").values.purchasePrice).toBeUndefined();
  });
  it("flags monthly claims without annualizing them", () => {
    const draft = extractListing("Monthly Revenue: $50K\nAnnual Revenue: $600K\nSDE per month: $10K\nEBITDA: $120K / mo");
    expect(draft.values).toEqual({ annualRevenue: 600000 });
    expect(draft.warnings).toContain("Annual revenue includes a monthly claim. It was not annualized; confirm and enter an annual USD amount manually.");
    expect(draft.warnings).toContain("SDE includes a monthly claim. It was not annualized; confirm and enter an annual USD amount manually.");
    expect(draft.warnings).toContain("EBITDA includes a monthly claim. It was not annualized; confirm and enter an annual USD amount manually.");
  });
  it("flags a revenue amount whose label does not state its period", () => {
    const draft = extractListing("Revenue: $300K");
    expect(draft.values.annualRevenue).toBe(300000);
    expect(draft.warnings).toContain("The revenue label did not state an annual or TTM period. Confirm its reporting period before use.");
  });
  it("round-trips unicode through a fragment without putting values in a server query", () => {
    const draft = extractListing("Asking Price: $20K", "Café & co.");
    const fragment = listingFragment(draft);
    expect(listingFromFragment(fragment)?.title).toBe("Café & co.");
    expect(new URL(`https://example.com/${fragment}`).search).toBe("");
  });
  it("rejects oversized, nonfinite and invalid values", () => {
    expect(() => parseListingDraft(" ".repeat(12001))).toThrow();
    expect(() => parseListingDraft('{"kind":"acquisition-lens-listing","version":1,"values":{"sde":1e999}}')).toThrow();
    expect(() => listingFromFragment("#listing=%BAD")).toThrow();
  });
  it("rejects unsupported structure instead of silently discarding it", () => {
    const base = extractListing("Asking Price: $200K");
    for (const change of [
      { ...base, evidence: { purchasePrice: "document-supported" } },
      { ...base, values: { purchasePrice: 200000, ownerSalary: 50000 } },
      { ...base, quotes: { purchasePrice: "Asking Price: $200K", ownerSalary: "Seller pay: $50K" } },
      { ...base, warnings: [5] },
    ]) expect(() => parseListingDraft(JSON.stringify(change))).toThrow();
  });
  it("never fills missing listing values with sample assumptions", () => {
    const draft = parseListingDraft(JSON.stringify(extractListing("Asking Price: $200K")));
    const result = listingToInputs(draft);
    expect(result.business.ownerSalary).toBe(0);
    expect(result.business.sde).toBe(0);
    expect(result.financing.loanAmount).toBe(0);
    expect(result.evidence.purchasePrice).toBe("listing");
  });
  it("rejects executable and credential-bearing source links", () => {
    expect(safeListingUrl("javascript:alert(1)")).toBe("");
    expect(safeListingUrl("https://user:password@example.com")).toBe("");
  });
  it("keeps missing or malformed capture provenance unknown", () => {
    const base = { ...extractListing("Asking Price: $200K"), capturedAt: undefined };
    expect(parseListingDraft(JSON.stringify(base)).capturedAt).toBe("");
    expect(parseListingDraft(JSON.stringify({ ...base, capturedAt: "January 1" })).capturedAt).toBe("");
    expect(parseListingDraft(JSON.stringify({ ...base, capturedAt: "2026-11-15T12:30:00-05:00" })).capturedAt).toBe("2026-11-15T17:30:00.000Z");
  });
});
