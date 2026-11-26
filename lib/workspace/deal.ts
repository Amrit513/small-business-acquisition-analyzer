import { listingCaptureDate, type ListingDraft } from "@/lib/import/listing";

export const MAX_DEAL_NAME_LENGTH = 180;
export const fields = {
  purchasePrice: ["Purchase price", "USD"], annualRevenue: ["Annual revenue", "USD/year"],
  sde: ["Seller’s discretionary earnings (SDE)", "USD/year"], ebitda: ["EBITDA", "USD/year"],
  expenses: ["Operating expenses", "USD/year"], sellerCompensation: ["Seller pay included in SDE add-backs", "USD/year"],
  buyerPay: ["Buyer compensation for work", "USD/year"], managerCost: ["Additional replacement labor", "USD/year"],
  capex: ["Maintenance capital expenditure", "USD/year"], annualWorkingCapital: ["Annual working capital increase", "USD/year"],
  equity: ["Buyer cash invested", "USD"], bankDebt: ["Bank loan", "USD"], bankRate: ["Bank interest rate", "%"],
  bankYears: ["Bank term", "years"], sellerDebt: ["Seller note", "USD"], sellerRate: ["Seller interest rate", "%"],
  sellerYears: ["Seller term", "years"], closingCosts: ["Closing costs", "USD"], initialWorkingCapital: ["Working capital at close", "USD"],
} as const;
export type Field = keyof typeof fields;
export const fieldKeys = Object.keys(fields) as Field[];
export function linkableEvidenceFields(values:Values):Field[]{return fieldKeys.filter(k=>values[k]!==null);}
export const statuses = ["User assumption", "Listing claim", "Document reviewed by user"] as const;
export type Evidence = { value:number; period:string; location:string; excerpt:string; date:string; status:typeof statuses[number] };
export type Values = Record<Field, number | null>;
export type Settings = { coverageTarget:number; low:number; high:number; revenueChange:number; expenseChange:number; years:number };
export interface Deal {
  version:3; id:string; name:string; updatedAt:string; isSample:boolean; currency:"USD"; period:string;
  values:Values; evidence:Partial<Record<Field,Evidence>>; settings:Settings; earningsNote:string;
  assumptionsReviewed:boolean; listing?:ListingDraft; migrationNote?:string;
}
export const settingsDefault:Settings = { coverageTarget:1.25, low:2, high:4, revenueChange:0, expenseChange:0, years:5 };
export function newId():string {
  const bytes = new Uint8Array(16); globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b=>b.toString(16).padStart(2,"0")).join("");
}
export function blankDeal(id:string, now:string):Deal {
  return {version:3,id,name:"Untitled deal",updatedAt:now,isSample:false,currency:"USD",period:"",earningsNote:"",
    assumptionsReviewed:false,values:Object.fromEntries(fieldKeys.map(k=>[k,null])) as Values,evidence:{},settings:{...settingsDefault}};
}
export function sampleDeal():Deal {
  const d=blankDeal("atlas-example","2026-01-01T00:00:00.000Z");
  d.name="Atlas Home Services"; d.isSample=true; d.period="FY 2025"; d.assumptionsReviewed=true;
  d.values={purchasePrice:425000,annualRevenue:520000,sde:170000,ebitda:90000,expenses:430000,sellerCompensation:80000,
    buyerPay:60000,managerCost:0,capex:10000,annualWorkingCapital:5000,equity:123000,bankDebt:340000,bankRate:9.5,
    bankYears:10,sellerDebt:0,sellerRate:null,sellerYears:null,closingCosts:18000,initialWorkingCapital:20000};
  d.earningsNote="Operating earnings of $90,000 plus $80,000 of seller compensation explain entered SDE. The buyer works in the business.";
  d.evidence.sde={value:170000,period:d.period,location:"Fictional seller worksheet, line 3",excerpt:"Annual SDE: $170,000, including $80,000 in seller compensation.",date:"2026-01-01",status:"User assumption"};
  return d;
}
export function editValue(deal:Deal,k:Field,value:number|null):Deal {
  if(deal.values[k]===value) return deal;
  const evidence={...deal.evidence}; delete evidence[k];
  const earnings=["annualRevenue","expenses","sde","sellerCompensation"].includes(k);
  return {...deal,values:{...deal.values,[k]:value},evidence,assumptionsReviewed:false,earningsNote:earnings?"":deal.earningsNote};
}
export function editPeriod(deal:Deal,period:string):Deal {
  return deal.period===period?deal:{...deal,period,evidence:{},assumptionsReviewed:false};
}
export function removeEvidence(deal:Deal,k:Field):Deal {
  if(!deal.evidence[k])return deal;
  const evidence={...deal.evidence};delete evidence[k];
  return {...deal,evidence,assumptionsReviewed:false};
}
export function restoreEvidence(deal:Deal,k:Field,entry:Evidence,sourceDealId:string):Deal {
  if(deal.id!==sourceDealId)throw new Error("The active deal changed, so this source note cannot be restored here.");
  if(deal.values[k]!==entry.value||deal.period!==entry.period)throw new Error("The figure or reporting period changed, so this source note cannot be restored.");
  return {...deal,evidence:{...deal.evidence,[k]:entry},assumptionsReviewed:false};
}
export function validAmount(k:Field,v:unknown):v is number {
  return amountValidationMessage(k,v)===null;
}
export function amountValidationMessage(k:Field,v:unknown):string|null {
  if(typeof v!=="number" || !Number.isFinite(v)) return "Enter a finite number.";
  if(k==="bankRate"||k==="sellerRate") return v>=0&&v<=100?null:"Enter an interest rate from 0% to 100%.";
  if(k==="bankYears"||k==="sellerYears") return v>=0&&v<=100&&Math.abs(v*12-Math.round(v*12))<1e-7?null:"Enter a term from 0 to 100 years in whole-month increments.";
  const allowsLoss=["sde","ebitda","annualWorkingCapital"].includes(k);
  return v>=(allowsLoss?-1e12:0)&&v<=1e12?null:allowsLoss?"Enter an amount from −$1 trillion to $1 trillion.":"Enter an amount from $0 to $1 trillion.";
}
export function fromListing(listing:ListingDraft,id:string,now:string):Deal {
  const d=blankDeal(id,now);d.name=listing.title||"Imported listing";d.listing=listing;
  for(const k of ["purchasePrice","annualRevenue","sde","ebitda"] as const) {
    const val=listing.values[k];if(val===undefined) continue;d.values[k]=val;
    const quote=listing.quotes[k];if(quote)d.evidence[k]={value:val,period:"",location:listing.url||"Pasted listing",date:listingCaptureDate(listing.capturedAt),excerpt:quote,status:"Listing claim"};
  }
  return d;
}
