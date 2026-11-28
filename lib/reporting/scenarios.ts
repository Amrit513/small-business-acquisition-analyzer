import {usd,type Year} from "@/lib/calculations/workbench";

export interface ScenarioReportRow {label:string;value:string}

export function scenarioReportRow(year:Year):ScenarioReportRow {
  const coverage=year.coverage===null?(year.debt===0?"No scheduled debt":"Unknown"):year.coverage.toFixed(2)+"×";
  return {label:`Year ${year.year}`,value:`${usd(year.distribution)} / ${usd(year.baseline)} / ${coverage} / ${usd(year.debt)}`};
}
