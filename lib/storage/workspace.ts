import { openDB } from "idb";
import { MAX_DEAL_IMPORT_BYTES, parseDealExport, type SavedDeal } from "./analyses";
import { parseListingDraft } from "@/lib/import/listing";
import { parseJsonDocument } from "@/lib/import/json";
import { plausiblePastInstant } from "@/lib/import/time";
import { blankDeal, fieldKeys, MAX_DEAL_NAME_LENGTH, newId, statuses, validAmount, type Deal, type Field, type Evidence, type Settings } from "@/lib/workspace/deal";

const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==="object"&&!Array.isArray(x);
const str=(x:unknown,len:number):x is string=>typeof x==="string"&&x.length<=len;
const only=(x:Record<string,unknown>,keys:readonly string[])=>Object.keys(x).every(k=>keys.includes(k));
export function todayLocalDate(now=new Date()):string {
  const year=now.getFullYear(),month=String(now.getMonth()+1).padStart(2,"0"),day=String(now.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
}
const evidenceDate=(x:unknown):x is string=>str(x,10)&&(x===""||(/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x&&x<=todayLocalDate()));
const invalid=():never=>{throw new Error("Unsupported or invalid deal file. Your current deal has not been changed.");};
export function validSettings(s:unknown):s is Settings {
  if(!obj(s)||!only(s,["coverageTarget","low","high","revenueChange","expenseChange","years"]))return false;
  return ([["coverageTarget",0.01,10],["low",0.01,50],["high",0.01,50],["revenueChange",-100,100],["expenseChange",-100,100],["years",1,10]] as const).every(([k,min,max])=>typeof s[k]==="number"&&Number.isFinite(s[k])&&s[k]>=min&&s[k]<=max)&&Number.isInteger(s.years);
}
export function validateDeal(x:unknown):Deal {
  if(!obj(x)||!only(x,["version","id","name","updatedAt","isSample","currency","period","values","evidence","settings","earningsNote","assumptionsReviewed","listing","migrationNote"])||x.version!==3||x.currency!=="USD"||!str(x.id,256)||!x.id.trim()||!str(x.name,MAX_DEAL_NAME_LENGTH)||!x.name.trim()||
    !str(x.updatedAt,40)||!plausiblePastInstant(x.updatedAt)||typeof x.isSample!=="boolean"||!str(x.period,100)||!str(x.earningsNote,1500)||
    typeof x.assumptionsReviewed!=="boolean"||!validSettings(x.settings)||!obj(x.values)||!obj(x.evidence))return invalid();
  const v=x.values,e=x.evidence,d=blankDeal(x.id,x.updatedAt);
  if(!only(v,fieldKeys)||Object.keys(v).length!==fieldKeys.length||!only(e,fieldKeys))return invalid();
  Object.assign(d,{name:x.name,isSample:x.isSample,period:x.period,earningsNote:x.earningsNote,assumptionsReviewed:x.assumptionsReviewed,settings:Object.fromEntries(Object.keys(d.settings).map(k=>[k,x.settings && (x.settings as Settings)[k as keyof Settings]]))});
  for(const k of fieldKeys) {
    const n=v[k];if(n!==null&&!validAmount(k,n))return invalid();d.values[k]=n;
    const row=e[k];if(row===undefined)continue;
    if(!obj(row)||!only(row,["value","period","location","excerpt","date","status"])||n===null||row.value!==n||!str(row.period,100)||row.period!==d.period||!str(row.location,800)||!str(row.excerpt,600)||
      !evidenceDate(row.date)||!statuses.some(status=>status===row.status))return invalid();
    d.evidence[k]={value:n,period:row.period,location:row.location,excerpt:row.excerpt,date:row.date,status:row.status as Evidence["status"]};
  }
  if(x.migrationNote!==undefined){if(!str(x.migrationNote,1600))return invalid();d.migrationNote=x.migrationNote;}
  if(x.listing!==undefined)d.listing=parseListingDraft(JSON.stringify(x.listing));
  return d;
}
function migrate(old:SavedDeal):Deal {
  const d=blankDeal(old.id,old.updatedAt),b=old.business,f=old.financing;
  d.name=old.name.trim().slice(0,MAX_DEAL_NAME_LENGTH)||"Legacy deal";d.listing=old.listingSource;
  Object.assign(d.values,{purchasePrice:b.purchasePrice,annualRevenue:b.annualRevenue,sde:b.sde,ebitda:b.ebitda,expenses:b.currentExpenses,
    sellerCompensation:b.ownerSalary,closingCosts:f.closingCosts??null,equity:f.closingCosts===undefined?null:f.downPayment+f.closingCosts,
    bankDebt:f.loanAmount,bankRate:f.interestRate*100,bankYears:f.loanTermYears,sellerDebt:f.sellerFinancing?.amount??0,
    sellerRate:f.sellerFinancing?f.sellerFinancing.interestRate*100:null,sellerYears:f.sellerFinancing?.termYears??null});
  if(old.listingSource||old.needsListingReview){
    for(const k of fieldKeys)if(d.values[k]===0&&!(old.listingSource?.values[k as keyof typeof old.listingSource.values]===0))d.values[k]=null;
  }
  // Older exports did not require a whole number of payment months.
  for(const k of ["bankYears","sellerYears"] as const)if(d.values[k]!==null&&!validAmount(k,d.values[k]))d.values[k]=null;
  d.migrationNote="Opened as a copy of a legacy snapshot. Review its period, compensation, costs and earnings bridge. Historic labels, notes and source data remain in the original; no label has been promoted to verified evidence.";
  return d;
}
export function serialize(d:Deal):string {return JSON.stringify({schemaVersion:3,deal:validateDeal(d)},null,2);}
export function parseSnapshot(raw:string):Deal {
  if(raw.length>MAX_DEAL_IMPORT_BYTES||new TextEncoder().encode(raw).length>MAX_DEAL_IMPORT_BYTES)throw new Error("Files must be 256 KiB or smaller.");
  const x=parseJsonDocument(raw);
  return obj(x)&&x.schemaVersion===3?(only(x,["schemaVersion","deal"])?validateDeal(x.deal):invalid()):migrate(parseDealExport(raw));
}
async function db(){return openDB("acquisition-lens",1,{upgrade(data){const store=data.createObjectStore("deals",{keyPath:"id"});store.createIndex("by-updated","updatedAt");}});}
export type Stored={id:string;name:string;deal:Deal|null;original:string|null;legacy:boolean};
export function readStored(x:unknown):Stored|null {
  if(!obj(x)||!str(x.id,256))return null;
  const legacy=x.version!==3,name=str(x.name,1000)?x.name.slice(0,MAX_DEAL_NAME_LENGTH):"Unreadable snapshot";
  let raw:string;
  try{raw=JSON.stringify({schemaVersion:legacy?2:3,deal:x});}
  catch{return {id:x.id,name,deal:null,original:null,legacy};}
  let deal:Deal|null=null;try{deal=parseSnapshot(raw);}catch{/* Keep original available for recovery. */}
  return {id:x.id,name,deal,original:raw,legacy};
}
export async function library():Promise<Stored[]>{const dbi=await db();try{return (await dbi.getAll("deals")).map(readStored).filter((x):x is Stored=>x!==null).sort((a,b)=>(b.deal?.updatedAt??"").localeCompare(a.deal?.updatedAt??""));}finally{dbi.close();}}
export async function persist(deal:Deal){const d=validateDeal(deal),dbi=await db();try{await dbi.put("deals",d);}finally{dbi.close();}}
export async function erase(id:string){const dbi=await db();try{await dbi.delete("deals",id);}finally{dbi.close();}}
export function asCopy(d:Deal):Deal{return {...d,id:newId(),updatedAt:new Date().toISOString()};}
export function journalEntry(d:Deal,k:Field,status:Evidence["status"],location:string,excerpt:string,date:string):Deal {
  const value=d.values[k];if(value===null||!location.trim()||!excerpt.trim()||!date.trim())throw new Error("Enter the figure, source location, excerpt and review date first.");
  if(!evidenceDate(date))throw new Error("Enter a valid review date that is not in the future.");
  return validateDeal({...d,evidence:{...d.evidence,[k]:{value,period:d.period,status,location:location.trim(),excerpt:excerpt.trim(),date}},assumptionsReviewed:false});
}
