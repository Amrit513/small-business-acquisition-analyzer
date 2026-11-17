import {describe,expect,it,vi} from "vitest";
import {readUtf8File} from "../utf8";

const file=(bytes:number[])=>({size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer});

describe("local UTF-8 file boundary",()=>{
  it("preserves valid Unicode and accepts a leading byte-order mark",async()=>{
    const bytes=[0xef,0xbb,0xbf,...new TextEncoder().encode('{"name":"Café"}')];
    await expect(readUtf8File(file(bytes),100,"Too large")).resolves.toBe('{"name":"Café"}');
  });
  it("rejects malformed UTF-8 instead of inserting replacement characters",async()=>{
    await expect(readUtf8File(file([0x7b,0x22,0xc3,0x28,0x22,0x7d]),100,"Too large")).rejects.toThrow("not valid UTF-8");
  });
  it("checks declared and actual byte size before parsing",async()=>{
    const read=vi.fn().mockResolvedValue(new Uint8Array(5).buffer);
    await expect(readUtf8File({size:5,arrayBuffer:read},4,"Too large")).rejects.toThrow("Too large");
    expect(read).not.toHaveBeenCalled();
    await expect(readUtf8File({size:1,arrayBuffer:async()=>new Uint8Array(5).buffer},4,"Too large")).rejects.toThrow("Too large");
  });
});
