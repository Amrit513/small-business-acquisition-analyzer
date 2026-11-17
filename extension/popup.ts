import { extractListing, listingFields, listingFragment, listingLabels, parseListingDraft, reviewListingAmounts, type ListingDraft } from "../lib/import/listing";
import { screenListing } from "../lib/calculations/listingScreen";
import { readListingPage } from "./pageCapture";

let draft: ListingDraft | undefined;
let unreadableSavedDraft = false;
const $ = (id: string) => { const element = document.getElementById(id); if (!element) throw new Error(`Missing control ${id}`); return element; };
const status = (message: string) => { $("status").textContent = message; };
const inputs = new Map<string, HTMLInputElement>();
function showRecovery(show: boolean) { unreadableSavedDraft = show; $("recovery").hidden = !show; }

function readReviewed(): ListingDraft {
  if (!draft) throw new Error("Capture a listing first.");
  const reviewed=reviewListingAmounts(draft,Object.fromEntries(listingFields.map(field=>[field,inputs.get(field)?.value??""])));
  for(const field of listingFields){const input=inputs.get(field),invalid=!reviewed.ok&&reviewed.field===field;input?.setAttribute("aria-invalid",String(invalid));if(invalid)input?.setAttribute("aria-describedby","status");else input?.removeAttribute("aria-describedby");}
  if(!reviewed.ok){inputs.get(reviewed.field)?.focus();throw new Error(reviewed.message);}
  return { ...reviewed.draft, title: ($("title") as HTMLInputElement).value.trim() || "Imported listing" };
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
async function capture() {
  const button = $("capture") as HTMLButtonElement; button.disabled = true; status("Reading the selected page…");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !/^https?:\/\//.test(tab.url)) throw new Error("Open a regular business listing webpage first. Browser settings and PDF viewers cannot be captured.");
    const [capture] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: readListingPage });
    const [current] = await chrome.tabs.query({ active:true, currentWindow:true });
    if (tab.id !== current?.id || capture?.result?.url !== tab.url || current?.url !== tab.url) throw new Error("The active page changed. Capture the listing again.");
    if (!capture?.result?.text.trim()) throw new Error(capture?.result?.ambiguousArticles
      ? "This page has several listing cards. Select the text for one listing and capture again."
      : "This page could not be read. Select listing text and try again.");
    const replacingUnreadable = unreadableSavedDraft;
    render(extractListing(capture.result.text, capture.result.title, capture.result.url));
    status(replacingUnreadable ? "Review the extracted amounts, then save to replace the unreadable draft." : "Review the extracted amounts before using them.");
  } catch (error) { status(error instanceof Error ? error.message : "Capture failed. The website may restrict extension access."); }
  finally { button.disabled = false; }
}
async function action(work: () => void | Promise<unknown>) { try { await work(); } catch (error) { status(error instanceof Error ? error.message : "The action could not be completed."); } }
$("capture").addEventListener("click", () => void capture());
$("open").addEventListener("click", () => void action(async () => {
  const reviewed = readReviewed(); if (!Object.keys(reviewed.values).length) throw new Error("Enter at least one amount first.");
  await chrome.tabs.create({ url: `https://acquisition-lens.vercel.app/${listingFragment(reviewed)}` }); status("Opened a review in Acquisition Lens.");
}));
$("save").addEventListener("click", () => void action(async () => { const reviewed=readReviewed();try { await chrome.storage.local.set({ listingDraft: reviewed }); } catch { throw new Error("Draft could not be saved in this browser. Export JSON to keep a backup."); } showRecovery(false); status("Draft saved in this browser."); }));
$("export").addEventListener("click", () => void action(() => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(readReviewed(), null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "acquisition-lens-listing.json"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); status("Listing exported. Import it on the website whenever you are ready.");
}));
$("clear").addEventListener("click", () => void action(async () => { try { await chrome.storage.local.remove("listingDraft"); } catch { throw new Error("Draft could not be cleared. It remains visible and may still be stored in this browser."); } draft = undefined; showRecovery(false); $("review").hidden = true; inputs.clear(); status("Draft cleared from this browser."); }));
void action(async () => { let saved: Record<string, unknown>; try { saved = await chrome.storage.local.get("listingDraft"); } catch { throw new Error("Local draft storage is unavailable. Capture and export still work, but saving may fail."); } if (saved.listingDraft) { try { render(parseListingDraft(JSON.stringify(saved.listingDraft))); status("Restored your saved draft."); } catch { showRecovery(true); status("The saved draft could not be read. You can clear it or capture a new listing."); } } });

$("discard-corrupt").addEventListener("click", () => void action(async () => {try { await chrome.storage.local.remove("listingDraft"); } catch { throw new Error("Unreadable draft could not be removed from browser storage."); }showRecovery(false);status("Unreadable draft removed.");}));
