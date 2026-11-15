import {calculate,metricText,usd,type Metric} from "@/lib/calculations/workbench";
import type {Deal} from "@/lib/workspace/deal";
export function Comparison({deals,current}:{deals:Deal[];current:Deal}){
 const items=[current,...deals.filter(d=>d.id!==current.id)].slice(0,4);
 return <section className="sheet"><div className="sectionhead"><span className="folio">05 / COMPARISON</span><h2>Put assumptions side by side</h2><p>Incomplete deals are shown for reference, never ranked. Saved snapshots stay on this device.</p></div><div className="tablescroll" role="region" aria-label="Saved deal comparison" tabIndex={0}><table><caption>Annual USD, first year unless stated otherwise.</caption><thead><tr><th scope="col">Measure</th>{items.map(d=><th scope="col" key={d.id}>{d.name}{d.isSample?" · fictional":""}</th>)}</tr></thead><tbody>{[
 ["Screen","status"],["Purchase price","purchasePrice"],["Cash invested","equity"],["Buyer compensation","buyerPay"],
 ["SDE","sde"],["Bank debt","bankDebt"],["Seller debt","sellerDebt"],["Coverage","coverage"],["Cash to equity","distribution"],["Cash-on-cash","roi"],["Evidence links","linked"]
 ].map(([label,key])=><tr key={key}><th scope="row">{label}</th>{items.map(d=>{const r=calculate(d);return <td key={d.id}>{key==="status"?(r.ready?"Assumptions reviewed":"Incomplete"):key==="linked"?r.linked.length:key!==undefined&&key in d.values?usd(d.values[key as keyof Deal["values"]]):metricText(key as Metric,r)}</td>})}</tr>)}</tbody></table></div></section>;
}
