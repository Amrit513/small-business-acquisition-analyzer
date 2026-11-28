import { buildAmortizationSchedule } from "./financing";
import {roundToCents} from "./precision";
import { fieldKeys, fields, MAX_DEAL_NAME_LENGTH, MAX_EARNINGS_NOTE_LENGTH, MAX_REPORTING_PERIOD_LENGTH, validAmount, type Deal, type Field, type Values } from "@/lib/workspace/deal";

export const modelVersion="3.0";
type N=number|null;
const cents=roundToCents;
function sum(...ns:N[]):N {return ns.some(n=>n===null||!Number.isFinite(n))?null:cents(ns.reduce<number>((s,n)=>s+(n??0),0));}
function subtract(a:N,...bs:N[]):N {return sum(a,...bs.map(b=>b===null?null:-b));}
function ratio(a:N,b:N):N{return a===null||b===null||b<=0?null:a/b;}
function validatedValues(values:Values):Values {
  return Object.fromEntries(fieldKeys.map(k=>[k,values[k]!==null&&validAmount(k,values[k])?values[k]:null])) as Values;
}
export function scheduledPayments(v:Values,adjustBankRate=0):number[]|null {
  const result:number[]=[];
  for(const [p,r,y] of [["bankDebt","bankRate","bankYears"],["sellerDebt","sellerRate","sellerYears"]] as const){
    const principal=v[p],apr=v[r],years=v[y];if(principal===null||!validAmount(p,principal))return null;
    if(principal===0)continue;
    if(apr===null||!validAmount(r,apr)||years===null||!validAmount(y,years)||years<=0)return null;
    const rate=p==="bankDebt"?Math.min(100,Math.max(0,apr+adjustBankRate)):apr;
    buildAmortizationSchedule(principal,rate/100,years).forEach((m,i)=> {const j=Math.floor(i/12);result[j]=cents((result[j]??0)+m.payment);});
  }return result;
}
const required:Field[]=["purchasePrice","annualRevenue","sde","expenses","buyerPay","managerCost","capex","annualWorkingCapital","equity","bankDebt","sellerDebt","closingCosts","initialWorkingCapital"];
export const metrics={
  distribution:{name:"Pretax cash to equity",unit:"USD/year",formula:"SDE − buyer pay − additional labor − maintenance capex − working capital increase − scheduled debt payments",fields:["sde","buyerPay","managerCost","capex","annualWorkingCapital","bankDebt","bankRate","bankYears","sellerDebt","sellerRate","sellerYears"],note:"First 12 months. Buyer pay compensates work and is not an investment distribution. Excludes taxes and sale proceeds."},
  coverage:{name:"Screening debt coverage",unit:"×",formula:"(SDE − buyer pay − additional labor) ÷ scheduled debt payments",fields:["sde","buyerPay","managerCost","bankDebt","bankRate","bankYears","sellerDebt","sellerRate","sellerYears"],note:"First 12 months, before capex, working capital and taxes. The target is a user assumption, not a lender rule."},
  roi:{name:"Cash-on-cash return",unit:"%",formula:"First-year pretax cash to equity ÷ buyer cash invested",fields:["equity","sde","buyerPay","managerCost","capex","annualWorkingCapital","bankDebt","bankRate","bankYears","sellerDebt","sellerRate","sellerYears"],note:"Excludes appreciation, financing proceeds and buyer wages. Undefined without positive buyer cash. A screen, not an IRR."},
  payback:{name:"Simple payback",unit:"years",formula:"Buyer cash invested ÷ first-year pretax cash to equity",fields:["equity","sde","buyerPay","managerCost","capex","annualWorkingCapital","bankDebt","bankRate","bankYears","sellerDebt","sellerRate","sellerYears"],note:"Assumes year-one cash repeats. No payback period is reported for nonpositive distributions or zero equity."},
} as const;
export type Metric=keyof typeof metrics;
export interface Year{year:number; revenue:N;expenses:N;sde:N;debt:N;distribution:N;coverage:N;baseline:N}
export function calculate(d:Deal) {
  const entered=d.values,s=d.settings;
  const v=validatedValues(entered);
  const validCoverageTarget=Number.isFinite(s.coverageTarget)&&s.coverageTarget>=.01&&s.coverageTarget<=10;
  const validValuation=Number.isFinite(s.low)&&Number.isFinite(s.high)&&s.low>=.01&&s.low<=s.high&&s.high<=50;
  const validGrowth=Number.isFinite(s.revenueChange)&&s.revenueChange>=-100&&s.revenueChange<=100&&Number.isFinite(s.expenseChange)&&s.expenseChange>=-100&&s.expenseChange<=100;
  const validYears=Number.isInteger(s.years)&&s.years>=1&&s.years<=10;
  const payments=scheduledPayments(v),debt=payments===null?null:payments[0]??0;
  const laborAdjusted=subtract(v.sde,v.buyerPay,v.managerCost);
  const distribution=subtract(laborAdjusted,v.capex,v.annualWorkingCapital,debt);
  const sources=sum(v.equity,v.bankDebt,v.sellerDebt),uses=sum(v.purchasePrice,v.closingCosts,v.initialWorkingCapital);
  const gap=subtract(uses,sources),coverage=ratio(laborAdjusted,debt);
  const roi=ratio(distribution,v.equity),payback=v.equity!==null&&v.equity>0?ratio(v.equity,distribution):null;
  const operating=subtract(v.annualRevenue,v.expenses),bridge=subtract(v.sde,operating),remainingAdjustments=subtract(bridge,v.sellerCompensation);
  const issues:string[]=[];
  if(!d.name.trim())issues.push("Enter a deal name.");
  else if(d.name.length>MAX_DEAL_NAME_LENGTH)issues.push(`Keep the deal name to ${MAX_DEAL_NAME_LENGTH} characters or fewer.`);
  for(const k of fieldKeys) if(entered[k]!==null&&!validAmount(k,entered[k]))issues.push("Review "+fields[k][0].toLowerCase()+": outside the supported range.");
  const missing=required.filter(k=>entered[k]===null);if(missing.length)issues.push("Enter: "+missing.map(k=>fields[k][0].toLowerCase()).join(", ")+".");
  if(!d.period.trim())issues.push("Identify the annual reporting period.");
  else if(d.period.length>MAX_REPORTING_PERIOD_LENGTH)issues.push(`Keep the annual reporting period to ${MAX_REPORTING_PERIOD_LENGTH} characters or fewer.`);
  if(v.purchasePrice!==null&&v.purchasePrice<=0)issues.push("Enter a positive purchase price for this transaction.");
  if(gap!==null&&Math.abs(gap)>=0.01)issues.push(gap>0?"Funding is short. Reconcile sources and uses.":"Excess financing needs an identified use.");
  if(payments===null&&(v.bankDebt!==null||v.sellerDebt!==null))issues.push("Complete the amount, rate and term for each funded note.");
  if(bridge!==null&&(Math.abs(bridge)>=0.01||(v.sellerCompensation??0)>0)&&!d.earningsNote.trim())issues.push("Explain the earnings bridge and seller add-backs.");
  if(d.earningsNote.length>MAX_EARNINGS_NOTE_LENGTH)issues.push(`Keep the earnings reconciliation to ${MAX_EARNINGS_NOTE_LENGTH.toLocaleString("en-US")} characters or fewer.`);
  if(!validCoverageTarget)issues.push("Use a finite coverage target from 0.01× to 10×.");
  if(!validValuation)issues.push("Use ordered finite valuation multiples from 0.01× to 50×.");
  if(!validGrowth)issues.push("Use finite scenario changes from −100% to 100%.");
  if(!validYears)issues.push("Use a whole projection length from 1 to 10 years.");
  if(!d.assumptionsReviewed)issues.push("Review the assumptions and mark them reviewed in Evidence.");
  const valuationLow=v.sde!==null&&v.sde>0&&validValuation?cents(v.sde*s.low):null;
  const valuationHigh=valuationLow!==null?cents(v.sde!*s.high):null;
  const years:Year[]=validGrowth&&validYears?Array.from({length:s.years},(_,i)=>{
    const y=i+1; const rev=v.annualRevenue===null?null:cents(v.annualRevenue*Math.pow(1+s.revenueChange/100,y));
    const exp=v.expenses===null?null:cents(v.expenses*Math.pow(1+s.expenseChange/100,y));
    const earnings=sum(subtract(rev,exp),bridge),ds=payments===null?null:payments[i]??0;
    const labor=subtract(earnings,v.buyerPay,v.managerCost);
    return {year:y,revenue:rev,expenses:exp,sde:earnings,debt:ds,distribution:subtract(labor,v.capex,v.annualWorkingCapital,ds),coverage:ratio(labor,ds),baseline:subtract(laborAdjusted,v.capex,v.annualWorkingCapital,ds)};
  }):[];
  const linked=fieldKeys.filter(k=>{const e=d.evidence[k];return e&&e.value===v[k]&&e.period===d.period&&e.location.trim()&&e.excerpt.trim();});
  const bound=(x:number)=>Math.min(100,Math.max(0,x));
  const margin=ratio(v.sde,v.annualRevenue);
  const valueToPrice=ratio(valuationLow!==null&&valuationHigh!==null?(valuationLow+valuationHigh)/2:null,v.purchasePrice);
  const scoreParts={coverage:coverage===null||!validCoverageTarget?null:bound(70*coverage/s.coverageTarget),returns:roi===null?null:bound(100*roi/.35),
    payback:payback===null?null:bound(100*(10-payback)/7),margin:margin===null?null:bound(100*margin/.20),
    price:valueToPrice===null?null:bound(70*valueToPrice)};
  const score=!issues.length&&Object.values(scoreParts).every(n=>n!==null)
    ?Math.round(.30*scoreParts.coverage!+.25*scoreParts.returns!+.20*scoreParts.payback!+.15*scoreParts.margin!+.10*scoreParts.price!):null;
  return {debt,distribution,coverage,roi,payback,operating,bridge,remainingAdjustments,sources,uses,gap,years,issues,valuationLow,valuationHigh,linked,score,scoreParts,ready:issues.length===0};
}
export type Result=ReturnType<typeof calculate>;
export function sensitivity(d:Deal) {
  const v=validatedValues(d.values);return [0.8,0.9,1,1.1].flatMap(f=>(v.bankDebt!==null&&v.bankDebt>0?[-2,0,2]:[0]).map(change=>{
    const payments=scheduledPayments(v,change);const ds=payments===null?null:payments[0]??0;
    const adjusted=subtract(v.sde===null?null:cents(v.sde*f),v.buyerPay,v.managerCost);
    return {earningsPct:Math.round(f*100),rateChange:change,distribution:subtract(adjusted,v.capex,v.annualWorkingCapital,ds),coverage:ratio(adjusted,ds)};
  }));
}
const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
export function usd(n:N):string {return n===null?"Unknown":money.format(n===0?0:n);}
export function metricText(key:Metric,r:Pick<Result,Metric|"debt">):string{
  const n=r[key];if(n===null)return key==="coverage"&&r.debt===0?"No scheduled debt":key==="payback"||key==="roi"?"Not available":"Unknown";
  if(key==="distribution")return usd(n);if(key==="coverage")return n.toFixed(2)+"×";if(key==="roi")return (100*n).toFixed(1)+"%";return n.toFixed(2)+" years";
}
