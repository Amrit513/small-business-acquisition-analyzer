export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

const INSTANT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2}))$/;

function validCalendarInstant(value: string): boolean {
  const match = value.match(INSTANT);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= (monthDays[month - 1] ?? 0)
    && Number(hourText) <= 23 && Number(minuteText) <= 59 && Number(secondText) <= 59
    && (offsetHourText === undefined || (Number(offsetHourText) <= 23 && Number(offsetMinuteText) <= 59));
}

/** Accept a valid timezone-aware ISO instant that is not materially ahead of this device's clock. */
export function plausiblePastInstant(value: unknown, now = Date.now()): value is string {
  if (typeof value !== "string") return false;
  if (!validCalendarInstant(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= now + MAX_CLOCK_SKEW_MS;
}
