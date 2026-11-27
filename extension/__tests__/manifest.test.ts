import { describe, expect, it } from "vitest";
import manifest from "../manifest.json";
import { validateExtensionManifest } from "../../scripts/validate-extension-manifest.mjs";

const copy = () => structuredClone(manifest) as Record<string, unknown>;

describe("extension manifest privacy boundary", () => {
  it("accepts the packaged Manifest V3 surface", () => {
    expect(validateExtensionManifest(copy())).toMatchObject({
      manifest_version: 3,
      permissions: ["activeTab", "scripting", "storage"],
    });
  });

  it.each([
    ["broad host access", (value: Record<string, unknown>) => { value.host_permissions = ["<all_urls>"]; }],
    ["background execution", (value: Record<string, unknown>) => { value.background = { service_worker: "background.js" }; }],
    ["optional permissions", (value: Record<string, unknown>) => { value.optional_permissions = ["downloads"]; }],
    ["external connections", (value: Record<string, unknown>) => { value.externally_connectable = { matches: ["<all_urls>"] }; }],
  ])("rejects %s", (_name, mutate) => {
    const value = copy(); mutate(value);
    expect(() => validateExtensionManifest(value)).toThrow(/must not declare/);
  });

  it("rejects new permissions and network-capable extension pages", () => {
    const permission = copy(); permission.permissions = ["activeTab", "scripting", "storage", "tabs"];
    expect(() => validateExtensionManifest(permission)).toThrow(/must remain limited/);
    const network = copy(); network.content_security_policy = { extension_pages: "script-src 'self'; connect-src https:;" };
    expect(() => validateExtensionManifest(network)).toThrow(/no-network/);
  });
});
