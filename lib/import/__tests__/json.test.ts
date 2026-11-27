import {describe,expect,it} from "vitest";
import {parseJsonDocument} from "../json";

describe("strict JSON document parsing",()=>{
  it("rejects duplicate financial properties at every object depth",()=>{
    expect(()=>parseJsonDocument('{"values":{"purchasePrice":425000,"purchasePrice":240000}}')).toThrow(/Duplicate JSON property: purchasePrice/);
  });

  it("treats escaped and literal spellings of the same property as duplicates",()=>{
    expect(()=>parseJsonDocument('{"purchasePrice":425000,"purchase\\u0050rice":240000}')).toThrow(/Duplicate JSON property: purchasePrice/);
  });

  it("allows the same property name in separate objects and repeated array values",()=>{
    expect(parseJsonDocument('[{"value":1},{"value":2},"same","same"]')).toEqual([{value:1},{value:2},"same","same"]);
  });

  it("rejects excessive nesting with a controlled import error",()=>{
    const nested="[".repeat(101)+"0"+"]".repeat(101);
    expect(()=>parseJsonDocument(nested)).toThrow(/nesting is too deep/);
  });
});
