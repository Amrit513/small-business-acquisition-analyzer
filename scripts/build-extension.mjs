import { build } from "esbuild";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { deflateSync, deflateRawSync } from "node:zlib";
import { readValidatedExtensionManifest } from "./validate-extension-manifest.mjs";

// Small deterministic PNG and ZIP writers keep packaging independent of OS tools.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
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
async function zipFiles(root, paths) {
  const parts = [], directory = []; let offset = 0;
  for (const path of paths) {
    const name = Buffer.from(path), bytes = await readFile(`${root}/${path}`), data = deflateRawSync(bytes), crc = crc32(bytes);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8); local.writeUInt16LE(33, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(bytes.length, 22); local.writeUInt16LE(name.length, 26);
    const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(8, 10); entry.writeUInt16LE(33, 14); entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(data.length, 20); entry.writeUInt32LE(bytes.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
    parts.push(local, name, data); directory.push(entry, name); offset += local.length + name.length + data.length;
  }
  const central = Buffer.concat(directory), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(paths.length, 8); end.writeUInt16LE(paths.length, 10); end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, central, end]);
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
await writeFile("public/downloads/acquisition-lens-extension.zip", await zipFiles(output, files));
console.log(`Extension built: ${files.length} files; app icons and downloadable ZIP ready.`);
