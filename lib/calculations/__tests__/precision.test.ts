import {describe,expect,it} from "vitest";
import {roundDecimal,roundToCents} from "../precision";

describe("financial decimal rounding",()=>{
  it.each([
    [1.005,1.01],[-1.005,-1.01],[100.005,100.01],[-100.005,-100.01],
    [1.004,1],[-1.004,-1],[1.335,1.34],[-1.335,-1.34],
  ])("rounds %s to symmetric cents",(value,expected)=>expect(roundToCents(value)).toBe(expected));

  it("preserves the four-decimal ratio precision used by the retained engine",()=>{
    expect(roundDecimal(1.23456,4)).toBe(1.2346);
    expect(roundDecimal(-1.23456,4)).toBe(-1.2346);
  });
});
