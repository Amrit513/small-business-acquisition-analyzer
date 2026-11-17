/**
 * Parse a JSON document while tolerating the single leading U+FEFF marker
 * produced by some UTF-8 editors. Callers still enforce their exact schemas.
 */
export function parseJsonDocument(raw: string): unknown {
  return JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
}
