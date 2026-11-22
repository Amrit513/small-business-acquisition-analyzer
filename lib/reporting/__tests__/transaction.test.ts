import {describe,expect,it} from "vitest";
import {formatDebtTerms} from "@/lib/reporting/transaction";
import {blankDeal} from "@/lib/workspace/deal";

describe("debt term reporting",()=>{
  it("keeps known rate and term visible when principal is unknown",()=>{
    const deal=blankDeal("draft","2026-11-22T00:00:00.000Z");
    deal.values.bankRate=9.5;
    deal.values.bankYears=10;
    expect(formatDebtTerms(deal,"bank")).toBe("Unknown amount · 9.5% annual · 10 years");
  });

  it("labels every missing note field without substituting zero",()=>{
    expect(formatDebtTerms(blankDeal("draft","2026-11-22T00:00:00.000Z"),"seller"))
      .toBe("Unknown amount · rate unknown · term unknown");
  });

  it("treats an explicit zero principal as no scheduled note",()=>{
    const deal=blankDeal("draft","2026-11-22T00:00:00.000Z");
    deal.values.sellerDebt=0;
    deal.values.sellerRate=8;
    deal.values.sellerYears=5;
    expect(formatDebtTerms(deal,"seller")).toBe("No note");
  });
});
