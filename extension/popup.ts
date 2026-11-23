import { extractListing, listingFields, listingFragment, listingLabels, MAX_LISTING_TITLE_LENGTH, parseListingDraft, reviewListingAmounts, type ListingDraft } from "../lib/import/listing";
import { screenListing } from "../lib/calculations/listingScreen";
import { readListingPage } from "./pageCapture";

let draft: ListingDraft | undefined;
let unreadableSavedDraft = false;
let operationInProgress = false;
const $ = (id: string) => { const element = document.getElementById(id); if (!element) throw new Error(`Missing control ${id}`); return element; };
const status = (message: string) => {
  const region = $("status");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.textContent = message;
};
const reportError = (message: string) => {
  const region = $("status");
  region.setAttribute("role", "alert");
  region.setAttribute("aria-live", "assertive");
  region.textContent = message;
};
const inputs = new Map<string, HTMLInputElement>();
const operationControlIds = ["capture", "open", "save", "export", "clear", "discard-corrupt"] as const;
type BrowserTab = { id?: number; url?: string };
type PageCapture = ReturnType<typeof readListingPage>;
function showRecovery(show: boolean) { unreadableSavedDraft = show; $("recovery").hidden = !show; }
function setOperationBusy(busy: boolean) {
  operationInProgress = busy;
  $("workspace").setAttribute("aria-busy", String(busy));
  for (const id of operationControlIds) ($(id) as HTMLButtonElement).disabled = busy;
}

function readReviewed(): ListingDraft {
  if (!draft) throw new Error("Capture a listing first.");
  const reviewed=reviewListingAmounts(draft,Object.fromEntries(listingFields.map(field=>[field,inputs.get(field)?.value??""])));
  for(const field of listingFields){const input=inputs.get(field),invalid=!reviewed.ok&&reviewed.field===field;input?.setAttribute("aria-invalid",String(invalid));if(invalid)input?.setAttribute("aria-describedby","status");else input?.removeAttribute("aria-describedby");}
  if(!reviewed.ok){inputs.get(reviewed.field)?.focus();throw new Error(reviewed.message);}
  const titleInput=$("title") as HTMLInputElement,title=titleInput.value.trim()||"Imported listing";
  const invalidTitle=title.length>MAX_LISTING_TITLE_LENGTH;titleInput.setAttribute("aria-invalid",String(invalidTitle));
  if(invalidTitle){titleInput.setAttribute("aria-describedby","status");titleInput.focus();throw new Error(`Business name must be ${MAX_LISTING_TITLE_LENGTH} characters or fewer.`);}
  titleInput.removeAttribute("aria-describedby");
  // Canonicalize every edited draft through the same strict boundary used by restore and handoff.
  return parseListingDraft(JSON.stringify({ ...reviewed.draft, title }));
}
function updateRatios() {
  try {
    const ratios = screenListing(readReviewed().values);
    $("multiple").textContent = ratios.askingToSde === null ? "Unknown" : `${ratios.askingToSde.toFixed(2)}×`;
    $("margin").textContent = ratios.sdeMargin === null ? "Unknown" : `${(ratios.sdeMargin * 100).toFixed(1)}%`;
    status("");
  } catch (error) { $("multiple").textContent = "Review inputs"; $("margin").textContent = "Review inputs"; status(error instanceof Error ? error.message : "Review the amounts."); }
}
function render(next: ListingDraft) {
  draft = next; showRecovery(false); $("review").hidden = false; ($("title") as HTMLInputElement).value = next.title;
  const source = $("source") as HTMLAnchorElement; source.hidden = !next.url; if (next.url) source.href = next.url;
  $("captured").textContent = next.capturedAt ? `Captured ${new Date(next.capturedAt).toLocaleString()}` : "Capture time unavailable";
  $("fields").replaceChildren(); inputs.clear();
  for (const field of listingFields) {
    const label = document.createElement("label"); label.textContent = `${listingLabels[field]} · USD`;
    const input = document.createElement("input"); input.id = `listing-${field}`; input.inputMode = "decimal"; input.placeholder = "Not found"; input.value = next.values[field]?.toString() ?? "";
    input.addEventListener("input", updateRatios); label.append(input); inputs.set(field, input);
    if (next.quotes[field]) { const quote = document.createElement("span"); quote.className = "quote"; quote.textContent = `Source: ${next.quotes[field]}`; label.append(quote); }
    $("fields").append(label);
  }
  $("warnings").replaceChildren(...next.warnings.map(message => { const item = document.createElement("li"); item.textContent = message; return item; })); updateRatios();
}
async function capture():Promise<{ focusId: string }|void> {
  if (draft && !globalThis.confirm("Replace the current reviewed listing? Save or export it first if you need a backup.")) {
    status("Current reviewed listing kept.");
    return;
  }
  status("Reading the selected page…");
  try {
    let tabs: BrowserTab[];
    try { tabs = await chrome.tabs.query({ active: true, currentWindow: true }); }
    catch { throw new Error("The active page could not be inspected. Open a regular business listing webpage and try again."); }
    const [tab] = tabs;
    if (!tab?.id || !tab.url || !/^https?:\/\//.test(tab.url)) throw new Error("Open a regular business listing webpage first. Browser settings and PDF viewers cannot be captured.");
    let captures: Array<{ result?: PageCapture }>;
    try { captures = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: readListingPage }); }
    catch { throw new Error("This page blocks listing capture. Copy the listing figures into the website or try another listing page."); }
    const [capture] = captures;
    let currentTabs: BrowserTab[];
    try { currentTabs = await chrome.tabs.query({ active:true, currentWindow:true }); }
    catch { throw new Error("The active page could not be confirmed. Capture the listing again."); }
    const [current] = currentTabs;
    if (tab.id !== current?.id || capture?.result?.url !== tab.url || current?.url !== tab.url) throw new Error("The active page changed. Capture the listing again.");
    if (!capture?.result?.text.trim()) throw new Error(capture?.result?.ambiguousArticles
      ? "This page has several listing cards. Select the text for one listing and capture again."
      : "This page could not be read. Select listing text and try again.");
    const replacingUnreadable = unreadableSavedDraft;
    render(extractListing(capture.result.text, capture.result.title, capture.result.url));
    status(replacingUnreadable ? "Review the extracted amounts, then save to replace the unreadable draft." : "Review the extracted amounts before using them.");
    return { focusId: "title" };
  } catch (error) { reportError(error instanceof Error ? error.message : "Capture failed. The website may restrict extension access."); }
}
type ActionResult = { focusId: string };
async function action(work: () => void | ActionResult | Promise<void | ActionResult>) {
  if (operationInProgress) return;
  let result: ActionResult | undefined;
  setOperationBusy(true);
  try { const completed = await work(); if (completed) result = completed; }
  catch (error) { reportError(error instanceof Error ? error.message : "The action could not be completed."); }
  finally { setOperationBusy(false); }
  if (result?.focusId) $(result.focusId).focus();
}
$("capture").addEventListener("click", () => void action(capture));
$("open").addEventListener("click", () => void action(async () => {
  const reviewed = readReviewed(); if (!Object.keys(reviewed.values).length) throw new Error("Enter at least one amount first.");
  try { await chrome.tabs.create({ url: `https://acquisition-lens.vercel.app/${listingFragment(reviewed)}` }); }
  catch { throw new Error("Acquisition Lens could not be opened. Keep this review and try again, or export JSON as a backup."); }
  status("Opened a review in Acquisition Lens.");
}));
$("save").addEventListener("click", () => void action(async () => { const reviewed=readReviewed();try { await chrome.storage.local.set({ listingDraft: reviewed }); } catch { throw new Error("Draft could not be saved in this browser. Export JSON to keep a backup."); } showRecovery(false); status("Draft saved in this browser."); }));
$("export").addEventListener("click", () => void action(() => {
  const reviewed=readReviewed();
  let url:string;
  try { url=URL.createObjectURL(new Blob([JSON.stringify(reviewed, null, 2)], { type: "application/json" })); }
  catch { throw new Error("Listing export could not be prepared. Keep this review and try again."); }
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "acquisition-lens-listing.json";
  try { anchor.click(); }
  catch { URL.revokeObjectURL(url); throw new Error("Listing export could not start. Keep this popup open and try again."); }
  setTimeout(() => URL.revokeObjectURL(url), 1000); status("Listing exported. Import it on the website whenever you are ready.");
}));
$("clear").addEventListener("click", () => void action(async () => {
  if (!globalThis.confirm("Clear this reviewed listing? Export JSON first if you need a backup.")) { status("Reviewed listing kept."); return; }
  try { await chrome.storage.local.remove("listingDraft"); } catch { throw new Error("Draft could not be cleared. It remains visible and may still be stored in this browser."); }
  draft = undefined; showRecovery(false); $("review").hidden = true; inputs.clear(); status("Draft cleared from this browser.");
  return { focusId: "capture" };
}));
void action(async () => { let saved: Record<string, unknown>; try { saved = await chrome.storage.local.get("listingDraft"); } catch { throw new Error("Local draft storage is unavailable. Capture and export still work, but saving may fail."); } if (saved.listingDraft) { try { render(parseListingDraft(JSON.stringify(saved.listingDraft))); status("Restored your saved draft."); } catch { showRecovery(true); status("The saved draft could not be read. You can clear it or capture a new listing."); } } });

$("discard-corrupt").addEventListener("click", () => void action(async () => {try { await chrome.storage.local.remove("listingDraft"); } catch { throw new Error("Unreadable draft could not be removed from browser storage."); }showRecovery(false);status("Unreadable draft removed.");return { focusId:"capture" };}));
