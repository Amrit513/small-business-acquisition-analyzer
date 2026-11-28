import { useState } from "react";
import { fields, fieldKeys, linkableEvidenceFields, MAX_EARNINGS_NOTE_LENGTH, removeEvidence, restoreEvidence, statuses, type Field, type Evidence as Entry } from "@/lib/workspace/deal";
import { journalEntry, todayLocalDate } from "@/lib/storage/workspace";
import { usd, type Result } from "@/lib/calculations/workbench";
import { evidenceStatusLabel } from "@/lib/reporting/provenance";
import type { Editor } from "./Inputs";

export function Evidence({ d, set, r }: Editor & { r: Result }) {
  const today = todayLocalDate();
  const [key, select] = useState<Field>("sde");
  const [status, label] = useState<Entry["status"]>("User assumption");
  const [location, loc] = useState("");
  const [excerpt, quote] = useState("");
  const [date, day] = useState(today);
  const [feedback, setFeedback] = useState({ message: "", error: false });
  const [removed, setRemoved] = useState<{ dealId: string; field: Field; entry: Entry } | null>(null);
  const linkable = linkableEvidenceFields(d.values), selected = linkable.includes(key) ? key : linkable[0];
  const say = (message: string, error = false) => setFeedback({ message, error });
  const describedBy = feedback.error ? "source-note-feedback" : undefined;

  return <><section className="sheet">
    <div className="sectionhead"><span className="folio">02 / EVIDENCE</span><h2>Follow the numbers</h2><p>A source note records what you reviewed. It does not authenticate the source.</p></div>
    {fieldKeys.filter(k => d.evidence[k]).map(k => {
      const entry = d.evidence[k]!;
      return <article className="evidence-row" key={k}><div className="spread"><strong>{fields[k][0]}</strong><span className="tag">{evidenceStatusLabel(entry.status)}</span></div><blockquote>{entry.excerpt}</blockquote><p>{entry.location} · {entry.period || "Period not recorded"} · {entry.date || "Date not recorded"}</p><button className="textaction" aria-label={`Remove source note for ${fields[k][0]}`} onClick={() => { setRemoved({ dealId: d.id, field: k, entry }); set(removeEvidence(d, k)); say(`Source note removed for ${fields[k][0]}.`); }}>Remove source note</button></article>;
    })}
    {removed && <p role="status">{feedback.message} <button className="textaction" onClick={() => {
      try { set(restoreEvidence(d, removed.field, removed.entry, removed.dealId)); say(`Source note restored for ${fields[removed.field][0]}.`); setRemoved(null); }
      catch (error) { say(error instanceof Error ? error.message : "The source note could not be restored.", true); setRemoved(null); }
    }}>Undo removal</button></p>}
    {!Object.keys(d.evidence).length && <p className="empty">No linked sources yet. Add a note from a listing or a document you have permission to use.</p>}
    {d.listing && <details className="group"><summary>Original listing capture</summary><div className="groupbody"><p>{d.listing.url || "Pasted text"} · {d.listing.capturedAt || "Capture time unknown"}</p>{Object.entries(d.listing.quotes).map(([field, value]) => <p key={field}>{value}</p>)}<small>Historical excerpts. Edited figures are no longer linked to the original claim.</small></div></details>}
    <details className="group"><summary>Add a source note</summary><form className="groupbody stack" onSubmit={event => {
      event.preventDefault();
      if (!selected) { say("Enter a financial figure before linking a source note.", true); return; }
      try { set(journalEntry(d, selected, status, location, excerpt, date)); loc(""); quote(""); setRemoved(null); say("Source note linked to the current value and period."); }
      catch (error) { say(error instanceof Error ? error.message : "Check the source note.", true); }
    }}>
      <div className="formgrid"><label>Figure<select value={selected ?? ""} disabled={!selected} aria-describedby="source-figure-help" onChange={event => select(event.target.value as Field)}>{!selected && <option value="">No entered figures</option>}{linkable.map(field => <option value={field} key={field}>{fields[field][0]}</option>)}</select><small id="source-figure-help">Only entered figures, including an explicit zero, can have source notes.</small></label><label>User-selected status<select value={status} aria-describedby="source-status-help" onChange={event => label(event.target.value as Entry["status"])}>{statuses.map(value => <option key={value}>{value}</option>)}</select><small id="source-status-help">This label records your review; it does not authenticate the source.</small></label></div>
      <label>Source and location<input value={location} maxLength={800} required aria-describedby={describedBy} onChange={event => loc(event.target.value)} placeholder="Document title, page or listing location" /></label>
      <label>Short excerpt<textarea value={excerpt} maxLength={600} required aria-describedby={describedBy} onChange={event => quote(event.target.value)} /></label>
      <label>Review date<input type="date" value={date} max={today} required aria-describedby={describedBy} onChange={event => day(event.target.value)} /></label>
      <button className="btn green" disabled={!selected}>Link source note</button>
      <p id="source-note-feedback" role={feedback.error ? "alert" : "status"} aria-live={feedback.error ? "assertive" : "polite"} aria-atomic="true">{removed ? "" : feedback.message}</p>
    </form></details>
  </section>
  <section className="sheet"><div className="sectionhead"><span className="folio">EARNINGS BRIDGE</span><h2>Explain the adjustment</h2><p>Revenue less expenses is {usd(r.operating)}. The difference to entered SDE is {usd(r.bridge)}. After entered seller compensation, the remaining adjustment is {usd(r.remainingAdjustments)}. Document every other add-back or difference.</p></div><label>Earnings reconciliation<textarea maxLength={MAX_EARNINGS_NOTE_LENGTH} value={d.earningsNote} onChange={event => set({ ...d, earningsNote: event.target.value, assumptionsReviewed: false })} /></label><label className="check"><input type="checkbox" checked={d.assumptionsReviewed} onChange={event => set({ ...d, assumptionsReviewed: event.target.checked })} />I reviewed the period, earnings bridge and funding assumptions for this screen.</label></section></>;
}
