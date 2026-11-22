export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/** Accept a real instant that is not materially ahead of this device's clock. */
export function plausiblePastInstant(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= Date.now() + MAX_CLOCK_SKEW_MS;
}
