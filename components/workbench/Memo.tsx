import type {Editor} from "./Inputs";
import {metrics,metricText,modelVersion,usd,type Result,type Metric} from "@/lib/calculations/workbench";
import {fields} from "@/lib/workspace/deal";
import {evidenceMetadata} from "@/lib/reporting/provenance";
import {formatDebtTerms} from "@/lib/reporting/transaction";
import {modelScreenStatus,sourceNoteStatus} from "@/lib/reporting/status";
export function Memo({d,r,onPrepare,pdf,loading,error}:Editor&{r:Result;onPrepare:()=>void;pdf:string|null;loading:boolean;error:string}){
 return <section className="sheet" aria-busy={loading}><div className="sectionhead"><span className="folio">04 / INVESTMENT MEMO</span><h2>What the screen can say</h2><p>Model {modelVersion} · {d.period||"Annual period missing"} · Educational analysis, not an appraisal or investment recommendation.</p></div>
 <p><b>Model status:</b> {modelScreenStatus(r)}. <b>Source-note support:</b> {sourceNoteStatus(r)}.</p>
 <div className="memogrid">{(Object.keys(metrics) as Metric[]).map(k=><div className="memorow" key={k}><span>{metrics[k].name}</span><strong>{metricText(k,r)}</strong><small>{metrics[k].note}</small></div>)}</div><p>The {d.settings.coverageTarget}× debt-coverage comparison target is a user-selected screening assumption, not a lender standard.</p>
 <h3>Transaction and earnings</h3><p>Sources: {usd(r.sources)}. Uses: {usd(r.uses)}. Difference: {usd(r.gap)}. The difference between entered SDE and revenue less operating expenses is {usd(r.bridge)}.</p><p>Bank note: {formatDebtTerms(d,"bank")}. Seller note: {formatDebtTerms(d,"seller")}.</p><p>{d.earningsNote||"The earnings bridge has not been explained."}</p>
 <h3>Valuation illustration</h3><p>{usd(r.valuationLow)} to {usd(r.valuationHigh)} at {d.settings.low}×–{d.settings.high}× entered SDE. This is an editable assumption, not a market quote.</p>
 <h3>Diligence questions</h3><ul className="questions">{(r.issues.length?r.issues:["Ask for source financial statements and reconcile tax returns, adjustments and labor requirements."]).map((s,i)=><li key={i}>{s}</li>)}{!r.linked.length&&<li>No figure has a currently linked source excerpt and reporting period.</li>}</ul>
 <h3>Source appendix</h3>{r.linked.map(k=>{const evidence=d.evidence[k]!,metadata=evidenceMetadata(evidence);return <p className="sourceitem" key={k}><b>{fields[k][0]} ({usd(d.values[k])})</b> · {evidence.status}<br/><span>{metadata.location} · {metadata.period} · {metadata.date}</span><br/>“{evidence.excerpt}”</p>;})}
 <div className="memoaction"><button className="btn green" disabled={!r.ready||loading} onClick={onPrepare}>{loading?"Preparing PDF…":"Prepare PDF memo"}</button>{pdf&&<a className="btn lime" download={"acquisition-lens-"+d.id+".pdf"} href={pdf}>Save prepared PDF</a>}</div><p role="status" aria-live="polite">{loading?"Preparing the PDF memo on this device…":error||(!r.ready?"Complete the flagged model assumptions to prepare a screening memo. You can still export a draft JSON.":pdf?"PDF is ready. Choose Save prepared PDF to download it.":"The PDF is created on this device when requested.")}</p></section>;
}
