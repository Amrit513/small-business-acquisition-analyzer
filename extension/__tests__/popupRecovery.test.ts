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
  id = "";
  clickCount = 0;
  focusCount = 0;
  clickError?: Error;
  attributes = new Map<string, string>();
  private listeners = new Map<string, Array<() => void>>();
  addEventListener(type: string, listener: () => void) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]); }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  removeAttribute(name: string) { this.attributes.delete(name); }
  focus() { this.focusCount++; }
  append() {}
  replaceChildren() {}
  click() { this.clickCount++; if(this.clickError)throw this.clickError;for (const listener of this.listeners.get("click") ?? []) listener(); }
}

const ids = ["workspace", "status", "recovery", "review", "title", "source", "captured", "fields", "warnings", "multiple", "margin", "capture", "open", "save", "export", "clear", "discard-corrupt"];
function popupDocument(options:{failExportClick?:boolean}={}) {
  const elements = Object.fromEntries(ids.map(id => [id, new ElementStub()])) as Record<string, ElementStub>;
  const created: ElementStub[] = [];
  elements.recovery!.hidden = true; elements.review!.hidden = true; elements.source!.hidden = true;
  return { elements, created, document: {
    getElementById: (id: string) => elements[id] ?? null,
    createElement: (tag:string) => { const element = new ElementStub();if(tag==="a"&&options.failExportClick)element.clickError=new Error("browser-internal download error");created.push(element); return element; },
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

    const purchasePrice = first.created.find(element => element.id === "listing-purchasePrice")!;
    purchasePrice.value = "$400K-$500K";
    first.elements.save!.click();
    await vi.waitFor(() => expect(first.elements.status!.textContent).toContain("one USD amount"));
    expect(purchasePrice.attributes.get("aria-invalid")).toBe("true");
    expect(purchasePrice.attributes.get("aria-describedby")).toBe("status");
    expect(purchasePrice.focusCount).toBe(1);
    expect(stored).toEqual({ malformed: true });
    purchasePrice.value = "425000";

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
    vi.stubGlobal("confirm", vi.fn(() => true));
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

  it("prevents clear from racing an in-progress save", async () => {
    const popup = popupDocument(); vi.stubGlobal("document", popup.document);
    let finishSave: (() => void) | undefined;
    const set = vi.fn(() => new Promise<void>(resolve => { finishSave = resolve; }));
    const remove = vi.fn(); const confirm = vi.fn(() => true); vi.stubGlobal("confirm", confirm);
    vi.stubGlobal("chrome", {
      storage: { local: { get: vi.fn(async () => ({ listingDraft: extractListing("SDE: $170,000", "Save race") })), set, remove } },
      tabs: { query: vi.fn(), create: vi.fn() }, scripting: { executeScript: vi.fn() },
    });

    await import("../popup");
    await vi.waitFor(() => expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.save!.click();
    await vi.waitFor(() => expect(set).toHaveBeenCalledOnce());
    expect(popup.elements.workspace!.attributes.get("aria-busy")).toBe("true");
    for (const id of ["capture", "open", "save", "export", "clear", "discard-corrupt"]) expect(popup.elements[id]!.disabled).toBe(true);

    popup.elements.clear!.click();
    expect(confirm).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    finishSave?.();

    await vi.waitFor(() => expect(popup.elements.status!.textContent).toBe("Draft saved in this browser."));
    expect(popup.elements.workspace!.attributes.get("aria-busy")).toBe("false");
    for (const id of ["capture", "open", "save", "export", "clear", "discard-corrupt"]) expect(popup.elements[id]!.disabled).toBe(false);
  });

  it("keeps the reviewed listing when clear is cancelled",async()=>{
    const popup=popupDocument();vi.stubGlobal("document",popup.document);
    const remove=vi.fn();const confirm=vi.fn(()=>false);vi.stubGlobal("confirm",confirm);
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:extractListing("SDE: $170,000","Keep this review")})),set:vi.fn(),remove}},
      tabs:{query:vi.fn(),create:vi.fn()},scripting:{executeScript:vi.fn()},
    });

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.clear!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Reviewed listing kept."));
    expect(confirm).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
    expect(popup.elements.review!.hidden).toBe(false);
    expect(popup.elements.title!.value).toBe("Keep this review");
  });

  it("keeps the review and revokes its Blob URL when export cannot start",async()=>{
    const popup=popupDocument({failExportClick:true});vi.stubGlobal("document",popup.document);
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:extractListing("Annual Revenue: $600,000","Export recovery")})),set:vi.fn(),remove:vi.fn()}},
      tabs:{query:vi.fn(),create:vi.fn()},scripting:{executeScript:vi.fn()},
    });
    vi.spyOn(URL,"createObjectURL").mockReturnValue("blob:failed-export");
    const revoke=vi.spyOn(URL,"revokeObjectURL").mockImplementation(()=>undefined);

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.export!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Listing export could not start. Keep this popup open and try again."));
    expect(popup.elements.status!.textContent).not.toContain("browser-internal");
    expect(revoke).toHaveBeenCalledWith("blob:failed-export");
    expect(popup.elements.review!.hidden).toBe(false);
    expect(popup.elements.title!.value).toBe("Export recovery");
  });

  it("keeps the review when the browser cannot prepare an export URL",async()=>{
    const popup=popupDocument();vi.stubGlobal("document",popup.document);
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:extractListing("SDE: $170,000","Export preparation recovery")})),set:vi.fn(),remove:vi.fn()}},
      tabs:{query:vi.fn(),create:vi.fn()},scripting:{executeScript:vi.fn()},
    });
    vi.spyOn(URL,"createObjectURL").mockImplementation(()=>{throw new Error("browser-internal blob error");});
    const revoke=vi.spyOn(URL,"revokeObjectURL").mockImplementation(()=>undefined);

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.export!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Listing export could not be prepared. Keep this review and try again."));
    expect(popup.elements.status!.textContent).not.toContain("browser-internal");
    expect(revoke).not.toHaveBeenCalled();
    expect(popup.elements.review!.hidden).toBe(false);
    expect(popup.elements.title!.value).toBe("Export preparation recovery");
  });

  it("keeps the current review when replacement capture is cancelled",async()=>{
    const popup=popupDocument();vi.stubGlobal("document",popup.document);
    const executeScript=vi.fn();
    const confirm=vi.fn(()=>false);vi.stubGlobal("confirm",confirm);
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:extractListing("Asking Price: $425,000","Current review")})),set:vi.fn(),remove:vi.fn()}},
      tabs:{query:vi.fn(),create:vi.fn()},scripting:{executeScript},
    });

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.capture!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Current reviewed listing kept."));
    expect(confirm).toHaveBeenCalledOnce();
    expect(executeScript).not.toHaveBeenCalled();
    expect(popup.elements.review!.hidden).toBe(false);
    expect(popup.elements.title!.value).toBe("Current review");
  });

  it("keeps the current review when a page blocks extension capture",async()=>{
    const popup=popupDocument();vi.stubGlobal("document",popup.document);vi.stubGlobal("confirm",vi.fn(()=>true));
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:extractListing("SDE: $170,000","Restricted-page review")})),set:vi.fn(),remove:vi.fn()}},
      tabs:{query:vi.fn(async()=>[{id:7,url:"https://example.com/restricted"}]),create:vi.fn()},
      scripting:{executeScript:vi.fn(async()=>{throw new Error("Cannot access contents of the page");})},
    });

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.capture!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("This page blocks listing capture. Copy the listing figures into the website or try another listing page."));
    expect(popup.elements.status!.textContent).not.toContain("Cannot access contents");
    expect(popup.elements.capture!.disabled).toBe(false);
    expect(popup.elements.review!.hidden).toBe(false);
    expect(popup.elements.title!.value).toBe("Restricted-page review");
  });

  it("keeps the review and offers an export fallback when handoff cannot open",async()=>{
    const popup=popupDocument();vi.stubGlobal("document",popup.document);
    const create=vi.fn(async()=>{throw new Error("browser-internal tab error");});
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:extractListing("Annual Revenue: $600,000","Handoff recovery")})),set:vi.fn(),remove:vi.fn()}},
      tabs:{query:vi.fn(),create},scripting:{executeScript:vi.fn()},
    });

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.open!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Acquisition Lens could not be opened. Keep this review and try again, or export JSON as a backup."));
    expect(popup.elements.status!.textContent).not.toContain("browser-internal");
    expect(create).toHaveBeenCalledOnce();
    expect(popup.elements.review!.hidden).toBe(false);
    expect(popup.elements.title!.value).toBe("Handoff recovery");
  });

  it("does not save an edited title that the extension cannot restore",async()=>{
    const popup=popupDocument();vi.stubGlobal("document",popup.document);
    let stored:unknown=extractListing("SDE: $170,000","Restorable title");
    const set=vi.fn(async(value:{listingDraft:unknown})=>{stored=value.listingDraft;});
    vi.stubGlobal("chrome",{
      storage:{local:{get:vi.fn(async()=>({listingDraft:stored})),set,remove:vi.fn()}},
      tabs:{query:vi.fn(),create:vi.fn()},scripting:{executeScript:vi.fn()},
    });

    await import("../popup");
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Restored your saved draft."));
    popup.elements.title!.value="x".repeat(161);
    popup.elements.save!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Business name must be 160 characters or fewer."));
    expect(popup.elements.title!.attributes.get("aria-invalid")).toBe("true");
    expect(popup.elements.title!.attributes.get("aria-describedby")).toBe("status");
    expect(popup.elements.title!.focusCount).toBe(1);
    expect(set).not.toHaveBeenCalled();
    expect(stored).toMatchObject({title:"Restorable title"});

    popup.elements.title!.value="Restorable edited title";
    popup.elements.save!.click();
    await vi.waitFor(()=>expect(popup.elements.status!.textContent).toBe("Draft saved in this browser."));
    expect(popup.elements.title!.attributes.get("aria-invalid")).toBe("false");
    expect(popup.elements.title!.attributes.has("aria-describedby")).toBe(false);
    expect(stored).toMatchObject({title:"Restorable edited title"});
  });
});
