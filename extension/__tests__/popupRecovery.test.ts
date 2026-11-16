import { afterEach, describe, expect, it, vi } from "vitest";

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
  private listeners = new Map<string, Array<() => void>>();
  addEventListener(type: string, listener: () => void) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]); }
  setAttribute() {}
  append() {}
  replaceChildren() {}
  click() { for (const listener of this.listeners.get("click") ?? []) listener(); }
}

describe("extension popup draft recovery", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it("hides stale recovery after recapture and replaces the unreadable draft on save", async () => {
    const ids = ["status", "recovery", "review", "title", "source", "captured", "fields", "warnings", "multiple", "margin", "capture", "open", "save", "export", "clear", "discard-corrupt"];
    const elements = Object.fromEntries(ids.map(id => [id, new ElementStub()])) as Record<string, ElementStub>;
    elements.recovery!.hidden = true; elements.review!.hidden = true; elements.source!.hidden = true;
    vi.stubGlobal("document", {
      getElementById: (id: string) => elements[id] ?? null,
      createElement: () => new ElementStub(),
    });
    let stored: unknown = { malformed: true };
    vi.stubGlobal("chrome", {
      storage: { local: {
        get: vi.fn(async () => ({ listingDraft: stored })),
        set: vi.fn(async (value: { listingDraft: unknown }) => { stored = value.listingDraft; }),
        remove: vi.fn(async () => { stored = undefined; }),
      } },
      tabs: {
        query: vi.fn(async () => [{ id: 7, url: "https://example.com/listing" }]),
        create: vi.fn(async () => undefined),
      },
      scripting: { executeScript: vi.fn(async () => [{ result: {
        text: "Asking Price: $425,000\nSDE: $170,000",
        title: "Fixture listing", url: "https://example.com/listing", ambiguousArticles: false,
      } }]) },
    });

    await import("../popup");
    await vi.waitFor(() => expect(elements.recovery!.hidden).toBe(false));
    expect(elements.status!.textContent).toContain("could not be read");

    elements.capture!.click();
    await vi.waitFor(() => expect(elements.status!.textContent).toContain("save to replace"));
    expect(elements.recovery!.hidden).toBe(true);
    expect(elements.review!.hidden).toBe(false);

    elements.save!.click();
    await vi.waitFor(() => expect(elements.status!.textContent).toBe("Draft saved in this browser."));
    expect(elements.recovery!.hidden).toBe(true);
    expect(stored).toMatchObject({ kind: "acquisition-lens-listing", title: "Fixture listing", values: { purchasePrice: 425000, sde: 170000 } });
  });
});
