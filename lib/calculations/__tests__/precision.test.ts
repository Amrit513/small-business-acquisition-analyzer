import {describe,expect,it} from "vitest";
import {roundDecimal,roundToCents,sumCents} from "../precision";

describe("financial decimal rounding",()=>{
  it.each([
    [1.005,1.01],[-1.005,-1.01],[100.005,100.01],[-100.005,-100.01],
    [1.004,1],[-1.004,-1],[1.335,1.34],[-1.335,-1.34],
  ])("rounds %s to symmetric cents",(value,expected)=>expect(roundToCents(value)).toBe(expected));

  it("preserves the four-decimal ratio precision used by the retained engine",()=>{
    expect(roundDecimal(1.23456,4)).toBe(1.2346);
    expect(roundDecimal(-1.23456,4)).toBe(-1.2346);
  });

  it("normalizes a rounded sub-cent loss to unsigned zero",()=>{
    const rounded=roundToCents(-0.004);
    expect(rounded).toBe(0);
    expect(Object.is(rounded,-0)).toBe(false);
  });

  it("normalizes each monetary operand before adding",()=>{
    expect(sumCents(0.005,0.005)).toBe(0.02);
    expect(sumCents(-0.005,-0.005)).toBe(-0.02);
    expect(sumCents(1.005,-1.005)).toBe(0);
  });
});
