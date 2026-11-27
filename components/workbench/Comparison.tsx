import type {Deal} from "@/lib/workspace/deal";
import {buildComparisonRows} from "@/lib/reporting/comparison";
export function Comparison({deals,current}:{deals:Deal[];current:Deal}){
 const items=[current,...deals.filter(d=>d.id!==current.id)].slice(0,4);
 const rows=buildComparisonRows(items);
 return <section className="sheet"><div className="sectionhead"><span className="folio">05 / COMPARISON</span><h2>Put assumptions side by side</h2><p>Incomplete deals are shown for reference, never ranked. Source notes record what a user reviewed; they do not authenticate a seller or document.</p></div><p className="scrollhint" id="comparison-scroll-help">Scroll horizontally to review every deal. Keyboard users can focus the table region and use the arrow keys.</p><div className="tablescroll" role="region" aria-label="Saved deal comparison" aria-describedby="comparison-scroll-help" tabIndex={0}><table><caption>Annual USD, first year unless stated otherwise. Differences describe assumptions, not a recommendation. Saved snapshots stay on this device.</caption><thead><tr><th scope="col">Measure</th>{items.map(d=><th scope="col" key={d.id}>{d.name}{d.isSample?" · fictional":""}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value,index)=><td key={items[index]!.id}>{value}</td>)}</tr>)}</tbody></table></div></section>;
}
