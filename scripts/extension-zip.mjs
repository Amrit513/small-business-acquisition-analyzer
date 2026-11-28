import { deflateRawSync, inflateRawSync } from "node:zlib";

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}

function safePath(path) {
  return path && !path.startsWith("/") && !path.includes("\\") && path.split("/").every(part => part && part !== "." && part !== "..");
}

export function zipEntries(entries) {
  const names = new Set(), parts = [], directory = []; let offset = 0;
  for (const [path, source] of entries) {
    if (!safePath(path) || names.has(path)) throw new Error(`Unsafe or duplicate extension ZIP path: ${path}`);
    names.add(path);
    const name = Buffer.from(path), bytes = Buffer.from(source), data = deflateRawSync(bytes), crc = crc32(bytes);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8); local.writeUInt16LE(33, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(bytes.length, 22); local.writeUInt16LE(name.length, 26);
    const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(8, 10); entry.writeUInt16LE(33, 14); entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(data.length, 20); entry.writeUInt32LE(bytes.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
    parts.push(local, name, data); directory.push(entry, name); offset += local.length + name.length + data.length;
  }
  const central = Buffer.concat(directory), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, central, end]);
}

export function readZipEntries(source) {
  const bytes = Buffer.from(source), endOffset = bytes.length - 22;
  if (endOffset < 0 || bytes.readUInt32LE(endOffset) !== 0x06054b50 || bytes.readUInt16LE(endOffset + 20) !== 0) throw new Error("Invalid extension ZIP end record.");
  const count = bytes.readUInt16LE(endOffset + 10), centralSize = bytes.readUInt32LE(endOffset + 12), centralOffset = bytes.readUInt32LE(endOffset + 16);
  if (centralOffset + centralSize !== endOffset) throw new Error("Invalid extension ZIP directory boundary.");
  const result = new Map(); let cursor = centralOffset;
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > endOffset || bytes.readUInt32LE(cursor) !== 0x02014b50) throw new Error("Invalid extension ZIP directory entry.");
    const method = bytes.readUInt16LE(cursor + 10), crc = bytes.readUInt32LE(cursor + 16), compressed = bytes.readUInt32LE(cursor + 20), size = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28), extraLength = bytes.readUInt16LE(cursor + 30), commentLength = bytes.readUInt16LE(cursor + 32), localOffset = bytes.readUInt32LE(cursor + 42);
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    if (!safePath(name) || result.has(name) || method !== 8) throw new Error(`Unsafe, duplicate or unsupported extension ZIP entry: ${name}`);
    if (localOffset + 30 > centralOffset || bytes.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`Invalid local ZIP entry for ${name}.`);
    const localMethod = bytes.readUInt16LE(localOffset + 8), localCrc = bytes.readUInt32LE(localOffset + 14), localCompressed = bytes.readUInt32LE(localOffset + 18), localSize = bytes.readUInt32LE(localOffset + 22);
    const localNameLength = bytes.readUInt16LE(localOffset + 26), localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const localName = bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString("utf8");
    if (localName !== name || localMethod !== method || localCrc !== crc || localCompressed !== compressed || localSize !== size) throw new Error(`ZIP entry metadata mismatch for ${name}.`);
    const start = localOffset + 30 + localNameLength + localExtraLength, end = start + compressed;
    if (end > centralOffset) throw new Error(`ZIP entry exceeds its data boundary: ${name}.`);
    const content = inflateRawSync(bytes.subarray(start, end));
    if (content.length !== size || crc32(content) !== crc) throw new Error(`ZIP integrity check failed for ${name}.`);
    result.set(name, content);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor !== endOffset) throw new Error("Extension ZIP directory contains trailing data.");
  return result;
}

export function assertZipEntries(archive, expectedEntries) {
  const expected = new Map(expectedEntries.map(([path, bytes]) => [path, Buffer.from(bytes)]));
  const actual = readZipEntries(archive);
  if (actual.size !== expected.size) throw new Error("Extension ZIP file allowlist mismatch.");
  for (const [path, bytes] of expected) if (!actual.get(path)?.equals(bytes)) throw new Error(`Extension ZIP content mismatch for ${path}.`);
}
