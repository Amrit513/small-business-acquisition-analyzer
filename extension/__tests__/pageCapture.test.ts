import { afterEach, describe, expect, it, vi } from "vitest";
import { readListingPage } from "../pageCapture";

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
});
