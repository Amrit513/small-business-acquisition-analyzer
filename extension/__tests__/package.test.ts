import { describe, expect, it } from "vitest";
import { assertZipEntries, readZipEntries, zipEntries } from "../../scripts/extension-zip.mjs";

const entries = [["manifest.json", Buffer.from('{"manifest_version":3}')], ["icons/icon.png", Buffer.from([1, 2, 3])]] as const;

describe("extension ZIP integrity", () => {
  it("round-trips the exact allowlisted paths and bytes", () => {
    const archive = zipEntries(entries);
    assertZipEntries(archive, entries);
    expect([...readZipEntries(archive)]).toEqual(entries.map(([path, bytes]) => [path, bytes]));
  });

  it.each(["../secret", "/absolute", "icons\\icon.png", "icons//icon.png"])("rejects unsafe path %s", path => {
    expect(() => zipEntries([[path, Buffer.from("x")]])).toThrow(/Unsafe or duplicate/);
  });

  it("rejects duplicate paths and corrupt central metadata", () => {
    expect(() => zipEntries([["same", Buffer.from("a")], ["same", Buffer.from("b")]])).toThrow(/Unsafe or duplicate/);
    const archive = zipEntries(entries), damaged = Buffer.from(archive);
    const directory = damaged.readUInt32LE(damaged.length - 6); damaged[directory + 16] = damaged[directory + 16]! ^ 1;
    expect(() => readZipEntries(damaged)).toThrow(/metadata mismatch/);
  });

  it("rejects a package whose actual contents differ from its allowlist", () => {
    expect(() => assertZipEntries(zipEntries(entries), [["manifest.json", Buffer.from("changed")]])).toThrow(/allowlist mismatch|content mismatch/);
  });
});
