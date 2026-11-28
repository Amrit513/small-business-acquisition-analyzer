import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { readListingPage } from "../pageCapture";
import { extractListing } from "@/lib/import/listing";

function page(options: { selection?: string; main?: string[]; articles?: string[]; editing?: boolean }) {
  vi.stubGlobal("location", { href: "https://example.com/listing" });
  vi.stubGlobal("window", { getSelection: () => ({ toString: () => options.selection ?? "" }) });
  vi.stubGlobal("document", {
    title: "Example listing",
    activeElement: { closest: () => options.editing ? {} : null },
    querySelectorAll: (selector: string) => (selector === "article" ? options.articles : options.main)?.map(innerText => ({ innerText })) ?? [],
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("extension page capture", () => {
  it("prefers an explicit selection over the main content and listing cards", () => {
    page({ selection: "Asking Price: $240K", main: ["Asking Price: $300K"], articles: ["Asking Price: $100K"] });
    expect(readListingPage().text).toBe("Asking Price: $240K");
  });
  it("uses the main region even when an article card appears first", () => {
    page({ main: ["", "Revenue: $400K"], articles: ["Revenue: $90K", "Revenue: $100K"] });
    expect(readListingPage().text).toBe("Revenue: $400K");
  });
  it("requires manual selection when multiple cards have no main region", () => {
    page({ articles: ["Asking Price: $100K", "Asking Price: $200K"] });
    expect(readListingPage()).toMatchObject({ text: "", ambiguousArticles: true });
  });
  it("supports a single article and avoids editable controls", () => {
    page({ articles: ["SDE: $40K"] });
    expect(readListingPage().text).toBe("SDE: $40K");
    page({ selection: "private input", editing: true });
    expect(readListingPage().text).toBe("");
  });
  it("caps returned text before it crosses the extension boundary", () => {
    page({ main: ["x".repeat(100000)] });
    expect(readListingPage().text).toHaveLength(60001);
  });
  it("captures the checked-in fictional acceptance fixture and ignores its decoy card", () => {
    const html=readFileSync("public/extension-acceptance.html","utf8");
    const main=html.match(/<main>([\s\S]*?)<\/main>/)?.[1]
      ?.replace(/<[^>]+>/g,"\n").split("\n").map(line=>line.trim()).filter(Boolean).join("\n");
    expect(main).toBeTruthy();
    page({main:[main!],articles:["Asking Price: $99,000"]});
    const captured=readListingPage();
    expect(extractListing(captured.text).values).toEqual({purchasePrice:425000,annualRevenue:520000,sde:170000,ebitda:125000});
    expect(captured.text).not.toContain("$99,000");
  });
});
