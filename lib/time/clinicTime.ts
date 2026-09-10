/**
 * The API stores and transmits every timestamp as UTC ISO-8601. The clinic
 * operates in `Asia/Kolkata`, and the doctor's calendar must render, group and
 * accept input in that timezone — never the server's or the browser's.
 *
 * These conversions go through `Intl.DateTimeFormat` with an explicit
 * `timeZone` rather than a hardcoded UTC+5:30 offset. Asia/Kolkata happens to
 * have no DST today, but reading the offset from the IANA database (via Intl)
 * instead of assuming it keeps this correct if that ever changes, and matches
 * how the rest of the stack should reason about timezones.
 */
export const CLINIC_TIMEZONE = "Asia/Kolkata";

export type ClinicDateParts = {
  readonly year: number;
  readonly month: number; // 1-12
  readonly day: number;
  readonly hour: number; // 0-23
  readonly minute: number;
};

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLINIC_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function partsFromDate(date: Date): ClinicDateParts {
  const found = partsFormatter.formatToParts(date);
  const get = (type: string) => Number(found.find((part) => part.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Reads a UTC ISO instant as wall-clock date/time in the clinic's timezone. */
export function utcIsoToClinicParts(utcIso: string): ClinicDateParts {
  return partsFromDate(new Date(utcIso));
}

/**
 * The inverse: given a wall-clock date/time *in the clinic's timezone*,
 * returns the UTC instant it corresponds to. Works by forward-formatting a
 * guess through the same `Intl` lookup and correcting for the offset found —
 * so it never hardcodes the offset, and stays correct across any DST-like
 * transition the IANA database might one day record for this zone.
 */
export function clinicPartsToUtcIso(parts: ClinicDateParts): string {
  const guessUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const guessClinicParts = partsFromDate(new Date(guessUtcMs));
  const guessClinicAsUtcMs = Date.UTC(
    guessClinicParts.year,
    guessClinicParts.month - 1,
    guessClinicParts.day,
    guessClinicParts.hour,
    guessClinicParts.minute,
  );
  const correctionMs = guessUtcMs - guessClinicAsUtcMs;
  return new Date(guessUtcMs + correctionMs).toISOString();
}

/** `YYYY-MM-DD` for the clinic-local calendar day a UTC instant falls on. */
export function clinicDateKey(utcIso: string): string {
  const { year, month, day } = utcIsoToClinicParts(utcIso);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Today's `YYYY-MM-DD` in the clinic's timezone, regardless of the viewer's own. */
export function clinicTodayDateKey(): string {
  return clinicDateKey(new Date().toISOString());
}

function dateKeyParts(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

/** The UTC instant of clinic-local midnight at the start of this calendar day. */
export function dateKeyToUtcIsoAtMidnight(dateKey: string): string {
  const { year, month, day } = dateKeyParts(dateKey);
  return clinicPartsToUtcIso({ year, month, day, hour: 0, minute: 0 });
}

/** A `[from, to)` UTC ISO pair spanning exactly one clinic-local calendar day. */
export function clinicDayRange(dateKey: string): { from: string; to: string } {
  return {
    from: dateKeyToUtcIsoAtMidnight(dateKey),
    to: dateKeyToUtcIsoAtMidnight(addDaysToDateKey(dateKey, 1)),
  };
}

/** Date-only arithmetic — safe as plain UTC-calendar math, no clinic-timezone conversion needed. */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const { year, month, day } = dateKeyParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/** 0 (Monday) .. 6 (Sunday) for a calendar date, independent of locale week-start settings. */
export function isoWeekdayIndex(dateKey: string): number {
  const { year, month, day } = dateKeyParts(dateKey);
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun..6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function startOfWeekDateKey(dateKey: string): string {
  return addDaysToDateKey(dateKey, -isoWeekdayIndex(dateKey));
}

export function weekDateKeys(dateKey: string): readonly string[] {
  const start = startOfWeekDateKey(dateKey);
  return Array.from({ length: 7 }, (_, index) => addDaysToDateKey(start, index));
}

export function startOfMonthDateKey(dateKey: string): string {
  const { year, month } = dateKeyParts(dateKey);
  return `${year}-${pad2(month)}-01`;
}

/**
 * Every date shown in a month grid, Monday-start, including the leading and
 * trailing days borrowed from the adjacent months so the grid is always full
 * weeks.
 */
export function monthGridDateKeys(dateKey: string): readonly string[] {
  const { year, month } = dateKeyParts(dateKey);
  const firstOfMonth = `${year}-${pad2(month)}-01`;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastOfMonth = `${year}-${pad2(month)}-${pad2(daysInMonth)}`;
  const gridStart = startOfWeekDateKey(firstOfMonth);
  const gridEnd = addDaysToDateKey(startOfWeekDateKey(lastOfMonth), 6);

  const keys: string[] = [];
  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDaysToDateKey(cursor, 1)) {
    keys.push(cursor);
  }
  return keys;
}

export function isSameDateKey(a: string, b: string): boolean {
  return a === b;
}

/** Minutes elapsed since clinic-local midnight of the day the instant falls on — used to position calendar grid rows. */
export function minutesSinceClinicMidnight(utcIso: string): number {
  const { hour, minute } = utcIsoToClinicParts(utcIso);
  return hour * 60 + minute;
}

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: CLINIC_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatClinicTime(utcIso: string): string {
  return timeFormatter.format(new Date(utcIso));
}

const dateLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: CLINIC_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatClinicDateLabel(utcIso: string): string {
  return dateLabelFormatter.format(new Date(utcIso));
}

export function formatDateKeyLabel(dateKey: string): string {
  return formatClinicDateLabel(dateKeyToUtcIsoAtMidnight(dateKey));
}

const weekdayShortFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: CLINIC_TIMEZONE,
  weekday: "short",
});

export function formatDateKeyWeekdayShort(dateKey: string): string {
  return weekdayShortFormatter.format(new Date(dateKeyToUtcIsoAtMidnight(dateKey)));
}

const dayNumberFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: CLINIC_TIMEZONE,
  day: "numeric",
});

export function formatDateKeyDayNumber(dateKey: string): string {
  return dayNumberFormatter.format(new Date(dateKeyToUtcIsoAtMidnight(dateKey)));
}

const monthYearFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: CLINIC_TIMEZONE,
  month: "long",
  year: "numeric",
});

export function formatDateKeyMonthYear(dateKey: string): string {
  return monthYearFormatter.format(new Date(dateKeyToUtcIsoAtMidnight(dateKey)));
}

/** Weekday key order the `working_hours` / `WeeklyWorkingHoursDto` shape uses. */
export const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export function weekdayKeyForDateKey(dateKey: string): WeekdayKey {
  return WEEKDAY_KEYS[isoWeekdayIndex(dateKey)];
}
