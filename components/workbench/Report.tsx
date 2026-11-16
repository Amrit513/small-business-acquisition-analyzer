import {Document,Page,Text,View,StyleSheet,Font} from "@react-pdf/renderer";
import {metrics,metricText,modelVersion,usd,type Metric, type Result} from "@/lib/calculations/workbench";
import {fields,type Deal} from "@/lib/workspace/deal";
let registered=false;
export function registerReportFont(base="/fonts"){
 if(registered)return;
 Font.register({family:"Liberation Sans",fonts:[{src:base+"/LiberationSans-Regular.ttf"},{src:base+"/LiberationSans-Bold.ttf",fontWeight:700}]});
 registered=true;
}
const st=StyleSheet.create({page:{padding:42,fontFamily:"Liberation Sans",fontSize:10,color:"#14251f",lineHeight:1.5},
 head:{backgroundColor:"#0b5142",padding:24,color:"#fff",marginBottom:22},
 eyebrow:{fontSize:9,letterSpacing:1.2,color:"#0b5142",marginBottom:6},
 title:{fontSize:23,fontWeight:700,lineHeight:1.4,marginBottom:12},sub:{fontSize:10,marginTop:3},
 section:{marginTop:16,marginBottom:7,paddingBottom:5,borderBottom:"1px solid #dce4e0",fontWeight:700,fontSize:13},
 row:{flexDirection:"row",justifyContent:"space-between",borderBottom:"1px solid #dce4e0",paddingVertical:6},
 metric:{fontWeight:700,color:"#0b5142"},muted:{fontSize:8,color:"#486156"},
 paragraph:{marginBottom:7},item:{marginBottom:7},footer:{position:"absolute",left:42,right:42,bottom:24,paddingTop:8,borderTop:"1px solid #dce4e0",fontSize:8,color:"#486156"}});
export function Report({deal:d,result:r,generated}:{deal:Deal;result:Result;generated:string}){
 const row=(label:string,value:string)=><View style={st.row} key={label} wrap={false}><Text>{label}</Text><Text style={st.metric}>{value}</Text></View>;
 const recorded=(value:string,fallback:string)=>value.trim()||fallback;
 return <Document title={"Acquisition Lens - "+d.name} author="Acquisition Lens" subject="Educational acquisition screen">
 <Page size="A4" style={st.page} wrap><View style={st.head}><Text style={[st.eyebrow,{color:"#ddea8a"}]}>ACQUISITION LENS / INVESTMENT MEMO</Text><Text style={st.title}>{d.name}</Text><Text style={st.sub}>{d.isSample?"Fictional sample · ":""}{recorded(d.period,"Period not recorded")} · Generated {generated}</Text></View>
 <Text style={st.section}>Executive screen</Text><Text style={st.paragraph}>This model illustrates a transaction under user-entered assumptions. It cannot verify claims or determine suitability. Pretax cash and screening debt coverage exclude taxes; coverage also excludes capex and working capital.</Text>
 {(Object.keys(metrics) as Metric[]).map(k=>row(metrics[k].name,metricText(k,r)))}
 <Text style={st.section}>Sources and uses</Text>{row("Purchase price",usd(d.values.purchasePrice))}{row("Closing costs",usd(d.values.closingCosts))}{row("Upfront working capital",usd(d.values.initialWorkingCapital))}{row("Total uses",usd(r.uses))}{row("Buyer cash",usd(d.values.equity))}{row("Bank note",usd(d.values.bankDebt))}{row("Seller note",usd(d.values.sellerDebt))}{row("Total sources",usd(r.sources))}{row("Funding difference",usd(r.gap))}
 <Text style={st.section}>Earnings and valuation</Text><Text style={st.paragraph}>Revenue minus expenses: {usd(r.operating)}. Entered SDE: {usd(d.values.sde)}. Bridge: {usd(r.bridge)}. {d.earningsNote}</Text><Text style={st.paragraph}>Illustrative SDE range: {usd(r.valuationLow)} to {usd(r.valuationHigh)} at user-selected {d.settings.low}×–{d.settings.high}×. Not an appraisal or verified comparable.</Text>
 </Page><Page size="A4" style={st.page} wrap><Text style={st.eyebrow}>ACQUISITION LENS / {d.name}</Text><Text style={st.title}>Scenarios & diligence</Text>
 <Text style={st.section}>First-year pretax cash-flow bridge</Text><Text style={st.paragraph}>Compensation for the buyer’s work is shown separately from return on invested cash. Taxes and sale proceeds are outside this screen.</Text>
 {row("Seller’s discretionary earnings",usd(d.values.sde))}{row("Less: buyer labor compensation",usd(d.values.buyerPay))}{row("Less: additional replacement labor",usd(d.values.managerCost))}{row("Less: maintenance capital expenditure",usd(d.values.capex))}{row("Less: working-capital increase",usd(d.values.annualWorkingCapital))}{row("Less: scheduled debt payments",usd(r.debt))}{row("Pretax cash to equity",usd(r.distribution))}
 <Text style={st.section}>Scenario assumptions and results</Text><Text style={st.paragraph}>Annual revenue {d.settings.revenueChange}%, expenses {d.settings.expenseChange}%. Debt uses scheduled payments at each maturity; flat baseline retains current operating figures.</Text>
 {r.years.map(y=>row("Year "+y.year+": cash / flat / debt",usd(y.distribution)+" / "+usd(y.baseline)+" / "+usd(y.debt)))}
 <Text style={st.section}>Diligence questions</Text>{(r.issues.length?r.issues:["Obtain and independently reconcile source statements, earnings adjustments, labor, capital expenditure and funding terms."]).map((q,i)=><Text style={st.item} key={i}>• {q}</Text>)}
 <Text style={st.section}>Source appendix</Text>{r.linked.length?r.linked.map(k=><View style={st.item} key={k} wrap={false}><Text style={st.metric}>{fields[k][0]}: {usd(d.values[k])} · {d.evidence[k]!.status}</Text><Text>{recorded(d.evidence[k]!.location,"Location not recorded")} · {recorded(d.evidence[k]!.period,"Period not recorded")} · {recorded(d.evidence[k]!.date,"Date not recorded")}</Text><Text>“{d.evidence[k]!.excerpt}”</Text></View>):<Text style={st.item}>No linked source excerpts.</Text>}
 <Text style={st.footer} fixed>Acquisition Lens · Model {modelVersion} · Generated {generated}. On-device, educational screen. No recommendation, lender determination, tax or legal opinion.</Text>
 </Page></Document>;
}
