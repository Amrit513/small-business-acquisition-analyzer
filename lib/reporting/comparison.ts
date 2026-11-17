import {calculate,metricText,usd} from "@/lib/calculations/workbench";
import type {Deal,Field} from "@/lib/workspace/deal";
import {formatDebtTerms} from "@/lib/reporting/transaction";

export interface ComparisonRow { label:string; values:string[] }

export function buildComparisonRows(deals:Deal[]):ComparisonRow[] {
  const results=deals.map(calculate);
  const value=(field:Field)=>deals.map(deal=>usd(deal.values[field]));
  return [
    {label:"Screen",values:results.map(result=>result.ready?"Assumptions reviewed":`Incomplete · ${result.issues.length} issue${result.issues.length===1?"":"s"}`)},
    {label:"Reporting period",values:deals.map(deal=>deal.period.trim()||"Not recorded")},
    {label:"Purchase price",values:value("purchasePrice")},
    {label:"Buyer cash invested",values:value("equity")},
    {label:"Buyer compensation",values:value("buyerPay")},
    {label:"Additional replacement labor",values:value("managerCost")},
    {label:"Maintenance capex",values:value("capex")},
    {label:"Annual working-capital increase",values:value("annualWorkingCapital")},
    {label:"SDE",values:value("sde")},
    {label:"Bank note · rate · term",values:deals.map(deal=>formatDebtTerms(deal,"bank"))},
    {label:"Seller note · rate · term",values:deals.map(deal=>formatDebtTerms(deal,"seller"))},
    {label:"Funding difference (uses − sources)",values:results.map(result=>usd(result.gap))},
    {label:"Coverage comparison target",values:deals.map(deal=>deal.settings.coverageTarget+"× user assumption")},
    {label:"Screening debt coverage",values:results.map(result=>metricText("coverage",result))},
    {label:"Pretax cash to equity",values:results.map(result=>metricText("distribution",result))},
    {label:"Cash-on-cash return",values:results.map(result=>metricText("roi",result))},
    {label:"Linked evidence figures",values:results.map(result=>String(result.linked.length))},
  ];
}
