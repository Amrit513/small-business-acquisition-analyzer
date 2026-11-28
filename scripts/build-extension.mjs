import { build } from "esbuild";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { assertZipEntries, crc32, zipEntries } from "./extension-zip.mjs";
import { readValidatedExtensionManifest } from "./validate-extension-manifest.mjs";

// Small deterministic PNG and ZIP writers keep packaging independent of OS tools.
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]); const output = Buffer.alloc(data.length + 12);
  output.writeUInt32BE(data.length); body.copy(output, 4); output.writeUInt32BE(crc32(body), output.length - 4); return output;
}
function icon(size) {
  const pixels = Buffer.alloc(size * (size * 3 + 1));
  const glyph = ["01110", "11011", "11011", "11111", "11011", "11011", "11011"];
  const unit = Math.max(1, Math.floor(size / 12));
  const left = Math.floor((size - 5 * unit) / 2), top = Math.floor((size - 7 * unit) / 2);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const gx = Math.floor((x - left) / unit), gy = Math.floor((y - top) / unit);
    const ink = gx >= 0 && gx < 5 && gy >= 0 && gy < 7 && glyph[gy][gx] === "1";
    const offset = y * (size * 3 + 1) + 1 + x * 3;
    pixels.set(ink ? [232, 255, 122] : [10, 92, 79], offset);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", header), chunk("IDAT", deflateSync(pixels)), chunk("IEND", Buffer.alloc(0))]);
}
const output = "dist/extension";
await readValidatedExtensionManifest();
await mkdir(`${output}/icons`, { recursive: true }); await mkdir("public/icons", { recursive: true }); await mkdir("public/downloads", { recursive: true });
for (const size of [16,48,128]) await writeFile(`${output}/icons/icon-${size}.png`, icon(size));
for (const size of [180,192,512]) await writeFile(`public/icons/icon-${size}.png`, icon(size));
for (const name of ["manifest.json", "popup.html", "popup.css"]) await copyFile(`extension/${name}`, `${output}/${name}`);
await copyFile("docs/EXTENSION.md", `${output}/README.md`);
await build({ entryPoints: ["extension/popup.ts"], outfile: `${output}/popup.js`, bundle: true, minify: true, platform: "browser", target: "chrome110", format: "iife", sourcemap: false });
await copyFile("LICENSE", `${output}/LICENSE`);
await copyFile("extension/PRIVACY.txt", `${output}/PRIVACY.txt`);
const files = ["LICENSE","PRIVACY.txt","manifest.json", "popup.html", "popup.css", "popup.js", "README.md", "icons/icon-16.png", "icons/icon-48.png", "icons/icon-128.png"];
const entries = await Promise.all(files.map(async path => [path, await readFile(`${output}/${path}`)]));
const archive = zipEntries(entries); assertZipEntries(archive, entries);
await writeFile("public/downloads/acquisition-lens-extension.zip", archive);
console.log(`Extension built: ${files.length} files; app icons and downloadable ZIP ready.`);
