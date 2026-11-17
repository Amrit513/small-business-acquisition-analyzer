// Build from the locked, installed packages. No registry calls or user data.
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFile(join(root, path), "utf8");
const lockBytes = await read("package-lock.json");
const lock = JSON.parse(lockBytes);
const supplements = JSON.parse(await read("docs/licenses/packages.json"));
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const hash = (data) => createHash("sha256").update(data).digest("hex");
const grantFile = /^(?:licen[sc]es?|copying|copyright)(?:$|[-_. ])/i;
const noticeFile = /^(?:notices?|third[-_. ]party[-_. ](?:licen[sc]es?|notices?))(?:$|[-_. ])/i;
const isTextNotice = (s) => (grantFile.test(s) || noticeFile.test(s) || /\.licen[sc]e\.txt$/i.test(s))
  && !/\.(?:[cm]?[jt]sx?|map|json|d\.ts|wasm|node|png|gif|woff2?)$/i.test(s);
const skipDirs = new Set(["node_modules", ".git", "__tests__", "tests", "test", "fixtures", "examples"]);

// Defined by this app's distribution: do not ship node_modules, server runtimes,
// native optimizers or the build toolchain to browsers / in the extension.
const tooling = name => name === "sharp" || name === "@next/env" || name.startsWith("@next/swc-")
  || name === "@opentelemetry/api" || name === "postcss";

function resolveLocked(from, name) {
  // Walk Node's lookup order, including nested versions in the lockfile.
  let base = from;
  while (true) {
    const target = base ? base + "/node_modules/" + name : "node_modules/" + name;
    if (Object.hasOwn(lock.packages, target)) return target;
    if (!base) return null;
    const i = base.lastIndexOf("/node_modules/");
    base = i === -1 ? "" : base.slice(0, i);
  }
}
const todo = [["", false]], visited = new Set(), browserPaths = new Set(), omitted = new Set();
while (todo.length) {
  const [from, host] = todo.pop(), state = String(host) + ":" + from;
  if (visited.has(state)) continue;
  visited.add(state);
  const pkg = lock.packages[from];
  if (from) (host ? omitted : browserPaths).add(from);
  const required = Object.keys(pkg.dependencies || {});
  const optional = Object.keys(pkg.optionalDependencies || {});
  const peers = Object.keys(pkg.peerDependencies || {});
  for (const dep of new Set([...required, ...optional, ...peers])) {
    const child = resolveLocked(from, dep);
    if (!child) {
      if (!optional.includes(dep) && !pkg.peerDependenciesMeta?.[dep]?.optional)
        throw Error("Lockfile has no installed resolution for " + dep + " from " + (from || "root"));
      continue;
    }
    // Optional native modules of sharp and Next remain in the host inventory.
    todo.push([child, host || (from === "node_modules/next" && tooling(dep))]);
  }
}
for (const path of browserPaths) omitted.delete(path);

async function notices(path, prefix = "") {
  const result = [];
  for (const f of await readdir(join(root, path, prefix), { withFileTypes: true })) {
    const rel = prefix ? prefix + "/" + f.name : f.name;
    if (f.isDirectory() && !skipDirs.has(f.name)) result.push(...await notices(path, rel));
    else if (f.isFile() && isTextNotice(f.name)) result.push(rel);
  }
  return result.sort(cmp);
}
const texts = new Map(), entries = [], issues = [];
function add(text, label, bucket) {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned || cleaned.includes("\0")) throw Error("Expected a nonempty text notice: " + label);
  const id = hash(cleaned);
  if (!texts.has(id)) texts.set(id, { text: cleaned, labels: new Set() });
  texts.get(id).labels.add(label);
  bucket.add(id);
}

for (const path of [...browserPaths].sort(cmp)) {
  const pkg = JSON.parse(await read(path + "/package.json"));
  const key = pkg.name + "@" + pkg.version;
  if (pkg.version !== lock.packages[path].version) throw Error("Run npm ci: " + path + " differs from the lockfile");
  const ids = new Set(), files = await notices(path);
  for (const file of files) add(await read(path + "/" + file), key + "/" + file, ids);
  const extra = supplements[key];
  if (extra) {
    for (const f of extra.files ?? []) add(await read("docs/licenses/" + f), key + ": " + f, ids);
    if (extra.attribution) add(extra.attribution, key + ": release attribution", ids);
  }
  if (!files.some(f => !f.includes("/") && grantFile.test(f)) && !extra?.primary)
    issues.push(key + " has no top-level license file or reviewed version-specific supplement.");
  entries.push({ key, ids, source: extra?.source, license: typeof pkg.license === "string" ? pkg.license : lock.packages[path].license || "see notices" });
}
const fontFiles = ["LiberationSans-Regular.ttf", "LiberationSans-Bold.ttf"];
for (const f of fontFiles) await readFile(join(root, "public/fonts", f));
const font = new Set();
add(await read("public/fonts/LICENSE.txt"), "Liberation Sans Regular and Bold: public/fonts/LICENSE.txt", font);
entries.push({key: "Liberation Sans — Regular and Bold", ids: font, license: "SIL-OFL-1.1", source: "Distributed font notice: /fonts/LICENSE.txt"});
const project = new Set();
add(await read("LICENSE"), "Acquisition Lens: repository LICENSE", project);
entries.push({key: "Acquisition Lens (project source)", ids: project, license: lock.packages[""].license || "see notice"});

if (issues.length) throw Error("Third-party notice review required:\n" + [...new Set(issues)].sort(cmp).map(s => "- " + s).join("\n"));
const ids = [...texts.keys()].sort(cmp);
const numbers = new Map(ids.map((id,i) => [id, String(i+1).padStart(3,"0")]));
const lines = [
  "Acquisition Lens | Software and font notices", "",
  "These are the authors’ terms and attribution notices, not financial advice or an endorsement.",
  "Inventory: the locked browser application dependency tree, conservatively including framework",
  "notices that may not be emitted into a particular page. Development tools and native",
  "server binaries are not part of the browser download. The extension has a separate license.",
  "package-lock.json SHA-256: " + hash(lockBytes), "", "Components and corresponding notice texts", ""
];
const seen = new Set();
for (const entry of entries.sort((a,b) => cmp(a.key,b.key))) {
  const row = entry.key + " [" + entry.license + "] — " + [...entry.ids].map(x=>numbers.get(x)).sort().join(", ");
  if (!seen.has(row)) { lines.push(row); if (entry.source) lines.push("  " + entry.source); seen.add(row); }
}
lines.push("", "Not distributed as browser modules (lockfile inventory; may include optional platforms):");
for (const label of [...new Set([...omitted].map(p => (lock.packages[p].name || p.split("node_modules/").at(-1)) + "@" + lock.packages[p].version))].sort(cmp)) lines.push("  " + label);
lines.push("", "Notice texts; identical texts are printed once.", "");
for (const id of ids) {
  const {text, labels} = texts.get(id);
  lines.push("=== " + numbers.get(id) + " ===", ...[...labels].sort(cmp), "", text, "");
}
const out = join(root,"public/downloads/THIRD-PARTY-NOTICES.txt");
await mkdir(dirname(out), {recursive:true});
const tmp = out + "." + process.pid + ".tmp";
await writeFile(tmp, lines.join("\n"), "utf8");
await rename(tmp, out);
console.log("Notices: " + entries.length + " entries; " + ids.length + " distinct texts -> " + relative(root,out));
