import { describe, expect, it } from "vitest";
import { MAX_CLOCK_SKEW_MS, plausiblePastInstant } from "../time";

const now = Date.parse("2026-11-27T15:00:00.000Z");

describe("imported timestamp boundary", () => {
  it.each([
    "2026-11-27T14:59:59Z",
    "2026-11-27T09:59:59-05:00",
    "2024-02-29T12:30:00.123+05:30",
  ])("accepts a valid timezone-aware ISO instant: %s", value => {
    expect(plausiblePastInstant(value, now)).toBe(true);
  });

  it.each([
    "November 27, 2026 10:00 AM",
    "2026-11-27",
    "2026-11-27T15:00:00",
    "2026-02-29T12:00:00Z",
    "2026-04-31T12:00:00Z",
    "2026-11-27T24:00:00Z",
    "2026-11-27T12:60:00Z",
    "2026-11-27T12:00:60Z",
    "2026-11-27T12:00:00+24:00",
  ])("rejects an informal, incomplete or impossible instant: %s", value => {
    expect(plausiblePastInstant(value, now)).toBe(false);
  });

  it("allows only the documented five-minute device-clock tolerance", () => {
    expect(plausiblePastInstant("2026-11-27T15:05:00Z", now)).toBe(true);
    expect(plausiblePastInstant(new Date(now + MAX_CLOCK_SKEW_MS + 1).toISOString(), now)).toBe(false);
  });
});
