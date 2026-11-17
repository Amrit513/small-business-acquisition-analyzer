export interface BinaryFile {
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/** Decode an untrusted local file without silently replacing malformed UTF-8 bytes. */
export async function readUtf8File(file: BinaryFile, maxBytes: number, oversizeMessage: string): Promise<string> {
  if (file.size > maxBytes) throw new Error(oversizeMessage);
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > maxBytes) throw new Error(oversizeMessage);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("This file is not valid UTF-8 text.");
  }
}
