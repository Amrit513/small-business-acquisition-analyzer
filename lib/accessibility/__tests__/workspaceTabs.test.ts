import {describe,expect,it} from "vitest";
import {nextWorkspaceTabIndex} from "../workspaceTabs";

describe("current five-tab workspace keyboard movement",()=>{
  it.each([
    [0,"ArrowRight",1],[4,"ArrowRight",0],[0,"ArrowLeft",4],
    [2,"ArrowDown",3],[2,"ArrowUp",1],[4,"Home",0],[0,"End",4],
  ] as const)("moves from %s with %s to %s",(current,key,expected)=>{
    expect(nextWorkspaceTabIndex(current,key,5)).toBe(expected);
  });

  it("leaves unrelated keys to native behavior",()=>{
    expect(nextWorkspaceTabIndex(0,"Tab",5)).toBeUndefined();
  });

  it.each([[5,"ArrowRight",5],[0,"ArrowRight",0]] as const)("rejects current %s for %s with count %s",(current,key,count)=>{
    expect(nextWorkspaceTabIndex(current,key,count)).toBeUndefined();
  });
});
