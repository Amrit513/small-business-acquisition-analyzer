import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const allowedPermissions = ["activeTab", "scripting", "storage"];
const forbiddenSurfaces = [
  "background",
  "content_scripts",
  "declarative_net_request",
  "declarative_net_request_with_host_access",
  "externally_connectable",
  "host_permissions",
  "optional_host_permissions",
  "optional_permissions",
  "proxy",
  "web_accessible_resources",
];

export function validateExtensionManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("Extension manifest must be an object.");
  if (manifest.manifest_version !== 3) throw new Error("Extension package must use Manifest V3.");
  const permissions = manifest.permissions;
  if (!Array.isArray(permissions) || permissions.some(value => typeof value !== "string")) throw new Error("Extension permissions must be a string array.");
  const sorted = [...new Set(permissions)].sort();
  if (sorted.length !== allowedPermissions.length || sorted.some((value, index) => value !== [...allowedPermissions].sort()[index])) {
    throw new Error(`Extension permissions must remain limited to ${allowedPermissions.join(", ")}.`);
  }
  for (const key of forbiddenSurfaces) if (key in manifest) throw new Error(`Extension manifest must not declare ${key}.`);
  if (manifest.action?.default_popup !== "popup.html") throw new Error("Extension action must open the packaged local popup.");
  const csp = manifest.content_security_policy?.extension_pages;
  if (csp !== "script-src 'self'; object-src 'none'; connect-src 'none'; base-uri 'none'") {
    throw new Error("Extension pages must keep the reviewed no-network content security policy.");
  }
  return manifest;
}

export async function readValidatedExtensionManifest(path = "extension/manifest.json") {
  return validateExtensionManifest(JSON.parse(await readFile(path, "utf8")));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await readValidatedExtensionManifest();
  console.log("Extension manifest privacy boundary validated.");
}
