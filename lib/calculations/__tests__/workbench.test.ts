import {describe,it,expect} from "vitest";
import {calculate,scheduledPayments,sensitivity,metricText} from "../workbench";
import {amountValidationMessage,blankDeal,MAX_DEAL_NAME_LENGTH,MAX_REPORTING_PERIOD_LENGTH,sampleDeal,editValue,editPeriod,fromListing,linkableEvidenceFields,removeEvidence,restoreEvidence} from "@/lib/workspace/deal";
import {serialize,parseSnapshot,readStored,journalEntry,todayLocalDate} from "@/lib/storage/workspace";
import {extractListing,parseListingDraft} from "@/lib/import/listing";

describe("v3 workbench against independent examples",()=>{
 it("reconciles the published Atlas transaction and annual debt cash flows",()=>{const r=calculate(sampleDeal());expect(r.ready).toBe(true);expect(r.sources).toBe(463000);expect(r.uses).toBe(463000);expect(r.bridge).toBe(80000);expect(r.remainingAdjustments).toBe(0);expect(r.debt).toBe(52794.24);expect(r.distribution).toBe(42205.76);expect(metricText("coverage",r)).toBe("2.08×");expect(metricText("roi",r)).toBe("34.3%");expect(r.linked).toEqual(["sde"]);});
 it("keeps the bridge remainder unknown until seller compensation is entered",()=>{const d=sampleDeal();d.values.sellerCompensation=null;expect(calculate(d).remainingAdjustments).toBeNull();d.values.sellerCompensation=50000;expect(calculate(d).remainingAdjustments).toBe(30000);});
 it("preserves entered SDE and applies sales and cost shocks independently",()=>{const d=sampleDeal();d.settings.revenueChange=-10;d.settings.expenseChange=3;const r=calculate(d);expect(r.years[0]).toMatchObject({sde:105100,distribution:-22694.24,baseline:42205.76});expect(r.years[0]?.coverage).toBeCloseTo(45100/52794.24);});
 it("uses actual maturity dates even within a year",()=>{const d=sampleDeal();Object.assign(d.values,{bankDebt:12000,bankRate:0,bankYears:2,sellerDebt:3000,sellerRate:0,sellerYears:.5});expect(scheduledPayments(d.values)).toEqual([9000,6000]);expect(calculate(d).years.map(y=>y.debt)).toEqual([9000,6000,0,0,0]);});
 it("distinguishes all-cash purchases from unfunded or zero-equity drafts",()=>{const d=sampleDeal();Object.assign(d.values,{equity:463000,bankDebt:0});let r=calculate(d);expect(r.ready).toBe(true);expect(r.distribution).toBe(95000);expect(metricText("coverage",r)).toBe("No scheduled debt");d.values.equity=0;r=calculate(d);expect(r.ready).toBe(false);expect(r.roi).toBeNull();expect(r.payback).toBeNull();expect(r.gap).toBe(463000);});
 it("retains losses and flags unexplained earnings, without inventing a valuation",()=>{const d=editValue(sampleDeal(),"sde",-3000);const r=calculate(d);expect(r.valuationLow).toBeNull();expect(r.distribution).toBeLessThan(0);expect(r.coverage).toBeLessThan(0);expect(r.payback).toBeNull();expect(r.issues.some(s=>s.includes("bridge"))).toBe(true);expect(r.linked).toEqual([]);});
 it("matches a sensitivity cell to a separately rebuilt deal",()=>{const d=sampleDeal(),cell=sensitivity(d).find(s=>s.earningsPct===80&&s.rateChange===2);d.values.sde=136000;d.values.bankRate=11.5;expect(cell?.distribution).toBe(calculate(d).distribution);});
 it("isolates invalid amounts from every sensitivity cell",()=>{const d=sampleDeal();d.values.capex=-1;let cells=sensitivity(d);expect(cells.every(cell=>cell.distribution===null)).toBe(true);d.values.capex=10000;d.values.sde=1e12+1;cells=sensitivity(d);expect(cells.every(cell=>cell.distribution===null&&cell.coverage===null)).toBe(true);});
 it("preserves unknowns and explicit zero across JSON; clears source linkage on edits",()=>{const listing=extractListing("Asking price: $0"),d=fromListing(listing,"test","2026-06-01");expect(d.evidence.purchasePrice?.date).toBe(todayLocalDate(new Date(listing.capturedAt)));const copy=parseSnapshot(serialize(d));expect(copy.values.purchasePrice).toBe(0);expect(copy.values.sde).toBeNull();expect(calculate(copy).ready).toBe(false);expect(editValue(copy,"purchasePrice",9).evidence.purchasePrice).toBeUndefined();expect(editPeriod(sampleDeal(),"FY 2026").evidence).toEqual({});});
 it("accepts a valid current deal file saved with a UTF-8 byte-order mark",()=>{expect(parseSnapshot("\ufeff"+serialize(sampleDeal())).values.sde).toBe(170000);});
 it("uses one deal-name boundary for current snapshots",()=>{const d=sampleDeal();d.name="A".repeat(MAX_DEAL_NAME_LENGTH);expect(parseSnapshot(serialize(d)).name).toHaveLength(MAX_DEAL_NAME_LENGTH);d.name+="B";expect(()=>serialize(d)).toThrow(/invalid deal file/);});
 it("restores evidence only to the unchanged deal it came from",()=>{const original=sampleDeal(),entry=original.evidence.sde!;const removed=removeEvidence(original,"sde");expect(removed.evidence.sde).toBeUndefined();expect(removed.assumptionsReviewed).toBe(false);expect(restoreEvidence(removed,"sde",entry,original.id).evidence.sde).toEqual(entry);expect(()=>restoreEvidence(editValue(removed,"sde",180000),"sde",entry,original.id)).toThrow(/changed/);expect(()=>restoreEvidence({...removed,id:"different-deal"},"sde",entry,original.id)).toThrow(/active deal changed/);});
 it("round-trips an unknown imported evidence date without inventing one",()=>{const listing=parseListingDraft(JSON.stringify({...extractListing("Asking price: $200K"),capturedAt:undefined}));const d=fromListing(listing,"test","2026-06-01");const copy=parseSnapshot(serialize(d));expect(copy.listing?.capturedAt).toBe("");expect(copy.evidence.purchasePrice?.date).toBe("");});
 it("offers source-note linkage only for entered figures while preserving explicit zero",()=>{const d=blankDeal("test","2026-06-01T00:00:00.000Z");d.values.purchasePrice=0;expect(linkableEvidenceFields(d.values)).toEqual(["purchasePrice"]);});
 it("rejects unknown version-three properties instead of silently discarding them",()=>{for(const mutate of [
  (x:Record<string,unknown>)=>{x.unexpected=true;},
  (x:Record<string,unknown>)=>{(x.deal as Record<string,unknown>).unexpected=true;},
  (x:Record<string,unknown>)=>{((x.deal as Record<string,unknown>).settings as Record<string,unknown>).unexpected=true;},
  (x:Record<string,unknown>)=>{((x.deal as Record<string,unknown>).values as Record<string,unknown>).unexpected=1;},
  (x:Record<string,unknown>)=>{((x.deal as Record<string,unknown>).evidence as Record<string,unknown>).unexpected={};},
  (x:Record<string,unknown>)=>{((((x.deal as Record<string,unknown>).evidence as Record<string,unknown>).sde) as Record<string,unknown>).unexpected=true;},
 ]){const imported=JSON.parse(serialize(sampleDeal())) as Record<string,unknown>;mutate(imported);expect(()=>parseSnapshot(JSON.stringify(imported))).toThrow(/invalid deal file/);}});
 it("rejects an inverted imported valuation range while accepting equal bounds",()=>{
  const inverted=JSON.parse(serialize(sampleDeal())) as {deal:{settings:{low:number;high:number}}};inverted.deal.settings.low=5;inverted.deal.settings.high=2;
  expect(()=>parseSnapshot(JSON.stringify(inverted))).toThrow(/invalid deal file/);
  const equal=sampleDeal();equal.settings.low=2;equal.settings.high=2;
  expect(parseSnapshot(serialize(equal)).settings).toMatchObject({low:2,high:2});
 });
 it("requires a review date for a newly entered source note",()=>{const d=sampleDeal();expect(()=>journalEntry(d,"sde","User assumption","Workbook p. 2","Entered SDE: $170,000","")).toThrow(/review date/);});
 it("rejects future evidence dates in manual notes and imported snapshots",()=>{const d=sampleDeal();expect(()=>journalEntry(d,"sde","User assumption","Workbook p. 2","Entered SDE: $170,000","9999-01-01")).toThrow(/not in the future/);d.evidence.sde!.date="9999-01-01";expect(()=>serialize(d)).toThrow(/invalid deal file/);});
 it("rejects future saved-record timestamps before they can distort library recency",()=>{const d=sampleDeal();d.updatedAt="9999-01-01T00:00:00.000Z";expect(()=>serialize(d)).toThrow(/invalid deal file/);expect(readStored(d)?.deal).toBeNull();});
 it("uses the device's local calendar day for dated report metadata",()=>{expect(todayLocalDate(new Date(2026,10,21,23,45))).toBe("2026-11-21");});
 it("rejects unsupported currency, nonfinite values, fractional months and forged evidence",()=>{for(const change of [(d:ReturnType<typeof sampleDeal>)=>Object.assign(d,{currency:"EUR"}),(d:ReturnType<typeof sampleDeal>)=>{d.values.sde=Infinity;},(d:ReturnType<typeof sampleDeal>)=>{d.values.bankYears=1.15;},(d:ReturnType<typeof sampleDeal>)=>{d.evidence.sde!.value=99;},(d:ReturnType<typeof sampleDeal>)=>{d.evidence.sde!.date="2026-02-30";}]){const d=sampleDeal();change(d);expect(()=>serialize(d)).toThrow();}});
 it("explains each rejected field with its actual supported boundary",()=>{
  expect(amountValidationMessage("bankRate",100.01)).toBe("Enter an interest rate from 0% to 100%.");
  expect(amountValidationMessage("bankYears",1.1)).toBe("Enter a term from 0 to 100 years in whole-month increments.");
  expect(amountValidationMessage("purchasePrice",-1)).toBe("Enter an amount from $0 to $1 trillion.");
  expect(amountValidationMessage("sde",-1)).toBeNull();
  expect(amountValidationMessage("sde",Number.POSITIVE_INFINITY)).toBe("Enter a finite number.");
 });
 it("makes corrupted local records recoverable without silently overwriting them",()=>{const item=readStored({id:"bad",version:3,name:"broken",saved:"untouched"});expect(item?.deal).toBeNull();expect(item?.original).toContain("untouched");});
 it("keeps corrupt blank-ID records out of the saved-deal library",()=>{expect(readStored({id:"   ",version:3,name:"Unaddressable snapshot"})).toBeNull();});
 it("isolates an unserializable local record without hiding its deletion control",()=>{const record:Record<string,unknown>={id:"cyclic",version:3,name:"Cyclic snapshot"};record.self=record;const item=readStored(record);expect(item).toMatchObject({id:"cyclic",name:"Cyclic snapshot",deal:null,original:null});});
 it("does not score unknown data or silently substitute sample values",()=>{const r=calculate(blankDeal("test","2026-01-01"));expect(r.distribution).toBeNull();expect(r.coverage).toBeNull();expect(r.sources).toBeNull();expect(r.ready).toBe(false);});
 it("rejects malformed in-memory settings before scoring or allocating projections",()=>{
  const coverage=sampleDeal();coverage.settings.coverageTarget=0;let r=calculate(coverage);expect(r.ready).toBe(false);expect(r.score).toBeNull();expect(r.scoreParts.coverage).toBeNull();expect(r.issues).toContain("Use a finite coverage target from 0.01× to 10×.");
  const years=sampleDeal();years.settings.years=100000;r=calculate(years);expect(r.years).toEqual([]);expect(r.issues).toContain("Use a whole projection length from 1 to 10 years.");
  const growth=sampleDeal();growth.settings.revenueChange=Number.NaN;r=calculate(growth);expect(r.years).toEqual([]);expect(r.issues).toContain("Use finite scenario changes from −100% to 100%.");
  const valuation=sampleDeal();valuation.settings.high=Number.POSITIVE_INFINITY;r=calculate(valuation);expect(r.valuationLow).toBeNull();expect(r.valuationHigh).toBeNull();expect(r.issues).toContain("Use ordered finite valuation multiples from 0.01× to 50×.");
 });
 it("isolates invalid in-memory amounts from every financial output",()=>{
  const earnings=sampleDeal();earnings.values.sde=Number.POSITIVE_INFINITY;let r=calculate(earnings);expect(r.distribution).toBeNull();expect(r.roi).toBeNull();expect(r.valuationLow).toBeNull();expect(r.valuationHigh).toBeNull();expect(r.scoreParts.margin).toBeNull();expect(r.years.every(y=>y.sde===null&&y.distribution===null)).toBe(true);expect(r.linked).toEqual([]);expect(r.ready).toBe(false);expect(r.score).toBeNull();
  const revenue=sampleDeal();revenue.values.annualRevenue=Number.POSITIVE_INFINITY;r=calculate(revenue);expect(r.operating).toBeNull();expect(r.years.every(y=>y.revenue===null&&y.sde===null)).toBe(true);expect(r.scoreParts.margin).toBeNull();expect(r.ready).toBe(false);
 });
 it("keeps an unnamed deal out of memo-ready status",()=>{const d=sampleDeal();d.name="   ";const r=calculate(d);expect(r.ready).toBe(false);expect(r.issues[0]).toBe("Enter a deal name.");expect(r.score).toBeNull();});
 it("keeps an overlong in-memory deal out of memo-ready status",()=>{const d=sampleDeal();d.name="A".repeat(MAX_DEAL_NAME_LENGTH+1);const r=calculate(d);expect(r.ready).toBe(false);expect(r.issues[0]).toBe(`Keep the deal name to ${MAX_DEAL_NAME_LENGTH} characters or fewer.`);expect(r.score).toBeNull();});
 it("keeps a deal with no reporting period out of memo-ready status",()=>{const d=sampleDeal();d.period="   ";const r=calculate(d);expect(r.ready).toBe(false);expect(r.issues).toContain("Identify the annual reporting period.");expect(r.score).toBeNull();});
 it("keeps an overlong in-memory period out of memo-ready status",()=>{const d=sampleDeal();d.period="A".repeat(MAX_REPORTING_PERIOD_LENGTH+1);const r=calculate(d);expect(r.ready).toBe(false);expect(r.issues).toContain(`Keep the annual reporting period to ${MAX_REPORTING_PERIOD_LENGTH} characters or fewer.`);expect(r.score).toBeNull();});
});
