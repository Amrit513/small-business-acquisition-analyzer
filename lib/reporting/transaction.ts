import {usd} from "@/lib/calculations/workbench";
import type {Deal} from "@/lib/workspace/deal";

export function formatDebtTerms(deal:Deal,kind:"bank"|"seller"):string {
  const amount=deal.values[kind==="bank"?"bankDebt":"sellerDebt"];
  const rate=deal.values[kind==="bank"?"bankRate":"sellerRate"];
  const years=deal.values[kind==="bank"?"bankYears":"sellerYears"];
  if(amount===null)return "Unknown amount";
  if(amount===0)return "No note";
  return `${usd(amount)} · ${rate===null?"rate unknown":rate+"% annual"} · ${years===null?"term unknown":years+" years"}`;
}
