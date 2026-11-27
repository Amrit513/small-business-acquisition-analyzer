import { useState } from "react";
import type { Deal, Field, Settings } from "@/lib/workspace/deal";
import { amountValidationMessage, editValue, editPeriod, fields, MAX_DEAL_NAME_LENGTH, MAX_REPORTING_PERIOD_LENGTH } from "@/lib/workspace/deal";
import { usd, type Result } from "@/lib/calculations/workbench";
export type Editor={d:Deal;set:(next:Deal)=>void};
const groups:{title:string;info:string;keys:Field[]}[]=[
 {title:"Price & operating earnings",info:"Use the same annual USD reporting period for all operating figures. A blank means unknown.",keys:["purchasePrice","annualRevenue","expenses","sde","ebitda","sellerCompensation"]},
 {title:"Labor & reinvestment",info:"Separate pay for doing the work from cash earned on the investment. Enter zero only if it is your assumption.",keys:["buyerPay","managerCost","capex","annualWorkingCapital"]},
 {title:"Sources & uses",info:"The price covers operating assets, excluding seller cash and existing debt. Include startup cash separately.",keys:["equity","bankDebt","sellerDebt","closingCosts","initialWorkingCapital"]},
];
export function AmountInput({d,k,set}:{k:Field}&Editor){
 const v=d.values[k],message=v===null?null:amountValidationMessage(k,v),bad=message!==null;
 return <label className="amount"><span>{fields[k][0]}</span><span className="inputwrap"><input type="number" step="any" inputMode="decimal" value={v??""} placeholder="Unknown" onChange={e=>set(editValue(d,k,e.target.value===""?null:Number(e.target.value)))} aria-invalid={bad} aria-describedby={bad?"err-"+k:undefined}/><small>{fields[k][1]}</small></span>{message&&<span className="error" id={"err-"+k} role="alert">{message}</span>}</label>;
}
export function Setting({d,set,k,label,min,max,step=0.01}:{k:keyof Settings;label:string;min:number;max:number;step?:number}&Editor){
 const [draft,change]=useState<string|null>(null),[bad,setBad]=useState(false);const n=d.settings[k],errorId=`setting-err-${k}`;
 return <label className="amount"><span>{label}</span><input type="number" min={min} max={max} step={step} value={draft??String(n)} aria-invalid={bad} aria-describedby={bad?errorId:undefined} onChange={e=>{const raw=e.target.value,invalid=raw!==""&&!e.target.validity.valid;change(raw);setBad(invalid);if(raw!==""&&!invalid)set({...d,settings:{...d.settings,[k]:Number(raw)}});}} onBlur={()=>{change(null);setBad(false);}}/>{bad&&<span className="error" id={errorId} role="alert">Enter a value from {min} to {max} in steps of {step}.</span>}</label>;
}
export function Inputs({d,set,r}:Editor&{r:Result}){
 const missingName=!d.name.trim(),missingPeriod=!d.period.trim();
 return <><section className="sheet"><div className="sectionhead"><span className="folio">01 / INPUTS</span><h2>Deal assumptions</h2><p>Enter what you know. Leave anything else blank.</p></div>
 <div className="formgrid introfields"><label className="amount"><span>Deal name</span><input maxLength={MAX_DEAL_NAME_LENGTH} value={d.name} aria-invalid={missingName} aria-describedby={missingName?"deal-name-error":undefined} onChange={e=>set({...d,name:e.target.value})}/>{missingName&&<span className="error" id="deal-name-error" role="alert">Enter a deal name before preparing a memo.</span>}</label><label className="amount"><span>Annual reporting period</span><input value={d.period} maxLength={MAX_REPORTING_PERIOD_LENGTH} placeholder="e.g. FY 2025" aria-invalid={missingPeriod} aria-describedby={missingPeriod?"deal-period-error":undefined} onChange={e=>set(editPeriod(d,e.target.value))}/>{missingPeriod&&<span className="error" id="deal-period-error" role="alert">Enter the annual reporting period before preparing a memo.</span>}</label></div>
 {groups.map((g,i)=><details key={g.title} className="group" open={i===0?true:undefined}><summary><span className="number">{String(i+1).padStart(2,"0")}</span>{g.title}</summary><div className="groupbody"><p>{g.info}</p><div className="formgrid">{g.keys.map(k=><AmountInput key={k} k={k} d={d} set={set}/>)}</div>
 {i===2&&<><div className="reconcile"><span>Sources <b>{usd(r.sources)}</b></span><span>Uses <b>{usd(r.uses)}</b></span><span>{r.gap!==null&&r.gap<0?"Excess funds":"Funding gap"} <b>{usd(r.gap===null?null:Math.abs(r.gap))}</b></span></div>{(["bank","seller"] as const).map(t=>(d.values[t==="bank"?"bankDebt":"sellerDebt"]??0)>0&&<div className="formgrid" key={t}>{(t==="bank"?["bankRate","bankYears"] as const:["sellerRate","sellerYears"] as const).map(k=><AmountInput key={k} k={k} d={d} set={set}/>)}</div>)}</>}
 </div></details>)}</section>
 <section className="sheet"><div className="sectionhead"><span className="folio">VALUATION ASSUMPTIONS</span><h2>What multiple are you testing?</h2><p>These are editable illustrations. A range based on positive SDE is not an appraisal.</p></div><div className="formgrid"><Setting d={d} set={set} k="low" label="Low SDE multiple (×)" min={0.01} max={50}/><Setting d={d} set={set} k="high" label="High SDE multiple (×)" min={0.01} max={50}/><Setting d={d} set={set} k="coverageTarget" label="Screening coverage target (×)" min={0.01} max={10}/></div></section></>;
}
