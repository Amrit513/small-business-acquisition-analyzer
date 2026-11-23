"use client";

import { useEffect, useRef, useState } from "react";
import { extractListing, listingFields, listingFromFragment, listingLabels, MAX_LISTING_IMPORT_BYTES, parseListingDraft, reviewListingAmounts, type ListingDraft, type ListingField } from "@/lib/import/listing";
import { readUtf8File } from "@/lib/import/utf8";
import { LatestOperation } from "@/lib/import/latest";
import { listingImportFailureMessage } from "@/lib/import/listingFailure";

export function ListingImport({ onApply }: { onApply: (draft: ListingDraft) => boolean }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<ListingDraft>();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [invalidField, setInvalidField] = useState<ListingField>();
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const amountRefs = useRef<Partial<Record<ListingField, HTMLInputElement | null>>>({});
  const focusNext = useRef<"review" | "text" | null>(null);
  const fileImport = useRef(new LatestOperation());

  function review(next: ListingDraft) {
    fileImport.current.invalidate();
    focusNext.current="review";
    setDraft(next); setAmounts(Object.fromEntries(listingFields.map(field => [field, next.values[field]?.toString() ?? ""]))); setError(undefined); setInvalidField(undefined); setOpen(true);
  }
  useEffect(()=>{
    if(focusNext.current==="review"&&draft){focusNext.current=null;titleRef.current?.focus();}
    if(focusNext.current==="text"&&open&&!draft){focusNext.current=null;textRef.current?.focus();}
  },[draft,open]);
  useEffect(() => {
    if (!window.location.hash.startsWith("#listing=")) return;
    const fragment = window.location.hash;
    // Remove the handoff from browser history before any further navigation.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    try { const imported = listingFromFragment(fragment); if (imported) review(imported); }
    catch { setError("That listing link could not be read. Import the extension's listing JSON instead."); setOpen(true); }
  }, []);

  async function readFile(file: File) {
    const current=fileImport.current.begin();
    try {
      const raw=await readUtf8File(file,MAX_LISTING_IMPORT_BYTES,"Listing files must be 12 KB or smaller.");
      if(!current())return;
      review(parseListingDraft(raw));
    } catch (err) { if(current())setError(listingImportFailureMessage(err)); }
  }
  function apply() {
    if (!draft) return;
    const reviewed=reviewListingAmounts(draft,amounts);
    if(!reviewed.ok){setInvalidField(reviewed.field);setError(reviewed.message);amountRefs.current[reviewed.field]?.focus();return;}
    setInvalidField(undefined);
    if (!Object.keys(reviewed.draft.values).length) { setError("Enter at least one listing amount to start a deal."); amountRefs.current.purchasePrice?.focus(); return; }
    if (!onApply(reviewed.draft)) {
      setError("Your current deal was kept. Save or export it, then try again.");
      return;
    }
    setDraft(undefined); setText(""); setError(undefined); setOpen(false); toggleRef.current?.focus();
  }
  return <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Start from a business listing</h2><p className="mt-1 text-sm text-slate-600">Paste listing text or bring in a capture from the browser extension.</p></div><button ref={toggleRef} type="button" aria-expanded={open} aria-controls="listing-import" onClick={() => {if(open)fileImport.current.invalidate();setOpen(!open);}} className="rounded-xl bg-[#0a5c4f] px-4 py-3 text-sm font-semibold text-white">{open ? "Close import" : "Import listing"}</button></div>
    {open && <div id="listing-import" className="mt-5 space-y-5">
      {!draft ? <><label className="block text-sm font-semibold" htmlFor="listing-text">Listing text</label><textarea ref={textRef} id="listing-text" value={text} onChange={e => setText(e.target.value)} rows={6} maxLength={60000} placeholder={"Asking Price: $425,000\nAnnual Revenue: $520,000\nSDE: $170,000"} className="w-full rounded-xl border border-slate-300 p-3 text-base" /><div className="flex flex-wrap gap-3"><button disabled={!text.trim()} onClick={() => review(extractListing(text))} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">Extract numbers</button><button onClick={() => fileRef.current?.click()} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">Import listing JSON</button><a href="/install" className="px-2 py-3 text-sm font-semibold text-emerald-800 underline">Get the extension</a></div><input ref={fileRef} aria-label="Import listing JSON" className="hidden" type="file" accept=".json,application/json" onChange={e => { const file = e.target.files?.[0]; if (file) void readFile(file); e.target.value = ""; }} /></> : <>
        <label className="block text-sm font-semibold">Business name<input ref={titleRef} className="field mt-2" maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
        {draft.url && <a href={draft.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-all text-sm text-emerald-800 underline">View source listing</a>}
        <div className="grid gap-4 sm:grid-cols-2">{listingFields.map(field => <label key={field} className="block text-sm font-semibold">{listingLabels[field]} · USD<input ref={element=>{amountRefs.current[field]=element;}} className="field mt-2" inputMode="decimal" placeholder="Not found" value={amounts[field] ?? ""} aria-invalid={invalidField===field} aria-describedby={invalidField===field?"listing-review-error":undefined} onChange={e => {setAmounts({ ...amounts, [field]: e.target.value });if(invalidField===field){setInvalidField(undefined);setError(undefined);}}} />{draft.quotes[field] && <span className="mt-1 block text-sm font-normal text-slate-500">Source: {draft.quotes[field]}</span>}</label>)}</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">{draft.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>
        <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">This starts a new deal and replaces the current inputs. Save your current deal first if needed. Missing figures and financing stay unknown; review them before generating a memo.</p>
        <div className="flex flex-wrap gap-3"><button onClick={apply} className="rounded-xl bg-[#0a5c4f] px-4 py-3 text-sm font-semibold text-white">Use reviewed numbers</button><button onClick={() => { focusNext.current="text"; setDraft(undefined); setError(undefined); setInvalidField(undefined); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">Back</button></div>
      </>}
      {error && <p id="listing-review-error" role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
      <p className="text-sm text-slate-500">Extraction runs on your device. Nothing is sent to an AI service.</p>
    </div>}
  </section>;
}
