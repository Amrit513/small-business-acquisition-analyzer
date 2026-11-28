import {describe,expect,it} from "vitest";
import {nextWorkspaceAction} from "@/lib/workspace/nextAction";

describe("workspace next action",()=>{
 it.each([
  ["Enter: purchase price, annual revenue.","Deal inputs","Review deal inputs"],
  ["Funding is short. Reconcile sources and uses.","Deal inputs","Review deal inputs"],
  ["Explain the earnings bridge and seller add-backs.","Evidence","Review evidence"],
  ["Review the assumptions and mark them reviewed in Evidence.","Evidence","Review evidence"],
 ] as const)("routes %s to %s",(issue,tab,label)=>{
  expect(nextWorkspaceAction(issue)).toEqual({tab,label});
 });

 it("opens downside scenarios after the model issues are resolved",()=>{
  expect(nextWorkspaceAction()).toEqual({tab:"Scenarios",label:"Open scenarios"});
 });
});
