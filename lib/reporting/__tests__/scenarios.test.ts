import {describe,expect,it} from "vitest";
import {scenarioReportRow} from "@/lib/reporting/scenarios";

describe("scenario memo reporting",()=>{
  it("retains scenario cash, flat cash, coverage and maturity-aware debt",()=>{
    expect(scenarioReportRow({year:1,revenue:520000,expenses:430000,sde:170000,debt:52794.24,distribution:42205.76,coverage:2.08356,baseline:42205.76})).toEqual({
      label:"Year 1",value:"$42,206 / $42,206 / 2.08× / $52,794",
    });
    expect(scenarioReportRow({year:3,revenue:520000,expenses:430000,sde:170000,debt:0,distribution:95000,coverage:null,baseline:95000}).value).toContain("No scheduled debt / $0");
  });
});
