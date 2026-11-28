import {describe,expect,it} from "vitest";
import {sellerCompensationDisclosure} from "@/lib/reporting/earnings";

describe("earnings reporting",()=>{
 it("does not imply that unknown seller compensation was confirmed",()=>{
  expect(sellerCompensationDisclosure(null)).toBe("Seller compensation in SDE add-backs has not been entered. No separate seller-compensation amount is added by this model.");
 });
 it("distinguishes an explicit zero from an unknown amount",()=>{
  expect(sellerCompensationDisclosure(0)).toBe("No seller compensation has been identified in SDE add-backs. The model does not add a separate seller-compensation amount.");
 });
 it("states that an entered add-back is not added twice",()=>{
  expect(sellerCompensationDisclosure(80000)).toBe("Seller compensation identified in SDE add-backs is $80,000; it is already embedded in entered SDE and is not added again.");
 });
});
