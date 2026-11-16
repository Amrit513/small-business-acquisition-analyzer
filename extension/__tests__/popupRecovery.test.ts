import { afterEach, describe, expect, it, vi } from "vitest";
import { extractListing, listingFromFragment } from "@/lib/import/listing";

class ElementStub {
  hidden = false;
  disabled = false;
  value = "";
  textContent = "";
  className = "";
  inputMode = "";
  placeholder = "";
  href = "";
  download = "";
  clickCount = 0;
  private listeners = new Map<string, Array<() => void>>();
  addEventListener(type: string, listener: () => void) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]); }
  setAttribute() {}
  append() {}
  replaceChildren() {}
  click() { this.clickCount++; for (const listener of this.listeners.get("click") ?? []) listener(); }
}

const ids = ["status", "recovery", "review", "title", "source", "captured", "fields", "warnings", "multiple", "margin", "capture", "open", "save", "export", "clear", "discard-corrupt"];
function popupDocument() {
  const elements = Object.fromEntries(ids.map(id => [id, new ElementStub()])) as Record<string, ElementStub>;
  const created: ElementStub[] = [];
  elements.recovery!.hidden = true; elements.review!.hidden = true; elements.source!.hidden = true;
  return { elements, created, document: {
    getElementById: (id: string) => elements[id] ?? null,
    createElement: () => { const element = new ElementStub(); created.push(element); return element; },
  } };
}

describe("extension popup local workflow", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.resetModules(); });

  it("recovers, captures, saves, exports, hands off and restores a reviewed draft", async () => {
    const first = popupDocument(); vi.stubGlobal("document", first.document);
    let stored: unknown = { malformed: true };
    const chromeStub = {
      storage: { local: {
        get: vi.fn(async () => ({ listingDraft: stored })),
        set: vi.fn(async (value: { listingDraft: unknown }) => { stored = value.listingDraft; }),
        remove: vi.fn(async () => { stored = undefined; }),
      } },
      tabs: {
        query: vi.fn(async () => [{ id: 7, url: "https://example.com/listing" }]),
        create: vi.fn(async (_input: { url: string }) => undefined),
      },
      scripting: { executeScript: vi.fn(async () => [{ result: {
        text: "Asking Price: $425,000\nSDE: $170,000",
        title: "Fixture listing", url: "https://example.com/listing", ambiguousArticles: false,
      } }]) },
    };
    vi.stubGlobal("chrome", chromeStub);
    const createUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fixture-export");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    await import("../popup");
    await vi.waitFor(() => expect(first.elements.recovery!.hidden).toBe(false));
    expect(first.elements.status!.textContent).toContain("could not be read");

    first.elements.capture!.click();
    await vi.waitFor(() => expect(first.elements.status!.textContent).toContain("save to replace"));
    expect(first.elements.recovery!.hidden).toBe(true);
    expect(first.elements.review!.hidden).toBe(false);

    first.elements.save!.click();
    await vi.waitFor(() => expect(first.elements.status!.textContent).toBe("Draft saved in this browser."));
    expect(first.elements.recovery!.hidden).toBe(true);
    expect(stored).toMatchObject({ kind: "acquisition-lens-listing", title: "Fixture listing", values: { purchasePrice: 425000, sde: 170000 } });

    first.elements.export!.click();
    await vi.waitFor(() => expect(first.elements.status!.textContent).toContain("Listing exported"));
    const anchor = first.created.find(element => element.download === "acquisition-lens-listing.json");
    expect(anchor).toMatchObject({ href: "blob:fixture-export", clickCount: 1 });
    const exported = JSON.parse(await (createUrl.mock.calls[0]![0] as Blob).text());
    expect(exported).toMatchObject({ title: "Fixture listing", values: { purchasePrice: 425000, sde: 170000 } });

    first.elements.open!.click();
    await vi.waitFor(() => expect(first.elements.status!.textContent).toBe("Opened a review in Acquisition Lens."));
    const handoff = chromeStub.tabs.create.mock.calls[0]![0].url;
    expect(new URL(handoff).search).toBe("");
    expect(listingFromFragment(new URL(handoff).hash)?.values).toMatchObject({ purchasePrice: 425000, sde: 170000 });

    vi.resetModules();
    const reopened = popupDocument(); vi.stubGlobal("document", reopened.document);
    await import("../popup");
    await vi.waitFor(() => expect(reopened.elements.status!.textContent).toBe("Restored your saved draft."));
    expect(reopened.elements.review!.hidden).toBe(false);
    expect(reopened.elements.title!.value).toBe("Fixture listing");
  });

  it("keeps the reviewed draft visible when browser storage writes or deletion fail", async () => {
    const popup = popupDocument(); vi.stubGlobal("document", popup.document);
    const set = vi.fn(async () => { throw new Error("browser-internal save error"); });
    const remove = vi.fn(async () => { throw new Error("browser-internal remove error"); });
    vi.stubGlobal("chrome", {
      storage: { local: { get: vi.fn(async () => ({ listingDraft: extractListing("Asking Price: $425,000", "Stored listing") })), set, remove } },
      tabs: { query: vi.fn(), create: vi.fn() }, scripting: { executeScript: vi.fn() },
    });

    await import("../popup");
    await vi.waitFor(() => expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));

    popup.elements.save!.click();
    await vi.waitFor(() => expect(popup.elements.status!.textContent).toContain("Export JSON"));
    expect(popup.elements.status!.textContent).not.toContain("browser-internal");
    expect(popup.elements.review!.hidden).toBe(false);

    popup.elements.clear!.click();
    await vi.waitFor(() => expect(popup.elements.status!.textContent).toContain("remains visible"));
    expect(popup.elements.status!.textContent).not.toContain("browser-internal");
    expect(popup.elements.review!.hidden).toBe(false);
  });
});
