export type ZipEntry = readonly [path: string, bytes: Uint8Array];
export function crc32(bytes: Uint8Array): number;
export function zipEntries(entries: readonly ZipEntry[]): Buffer;
export function readZipEntries(source: Uint8Array): Map<string, Buffer>;
export function assertZipEntries(archive: Uint8Array, expectedEntries: readonly ZipEntry[]): void;
