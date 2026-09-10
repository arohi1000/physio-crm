import { describe, expect, it } from "vitest";

import {
  addDaysToDateKey,
  clinicDateKey,
  clinicDayRange,
  clinicPartsToUtcIso,
  dateKeyToUtcIsoAtMidnight,
  formatClinicTime,
  isoWeekdayIndex,
  minutesSinceClinicMidnight,
  monthGridDateKeys,
  startOfWeekDateKey,
  utcIsoToClinicParts,
  weekDateKeys,
  weekdayKeyForDateKey,
} from "./clinicTime";

describe("utcIsoToClinicParts", () => {
  it("reads the task brief's fixture instant as 09:00 IST", () => {
    // "an 03:30:00.000Z slot is 09:00 to the doctor" — IST is UTC+5:30.
    expect(utcIsoToClinicParts("2026-03-05T03:30:00.000Z")).toEqual({
      year: 2026,
      month: 3,
      day: 5,
      hour: 9,
      minute: 0,
    });
  });

  it("rolls the calendar date forward when local time crosses midnight", () => {
    // 19:00 UTC + 5:30 = 00:30 the next clinic-local day.
    expect(utcIsoToClinicParts("2026-03-05T19:00:00.000Z")).toEqual({
      year: 2026,
      month: 3,
      day: 6,
      hour: 0,
      minute: 30,
    });
  });
});

describe("clinicPartsToUtcIso", () => {
  it("is the exact inverse of utcIsoToClinicParts on the fixture instant", () => {
    expect(clinicPartsToUtcIso({ year: 2026, month: 3, day: 5, hour: 9, minute: 0 })).toBe(
      "2026-03-05T03:30:00.000Z",
    );
  });

  it("round-trips across a month boundary", () => {
    const parts = { year: 2026, month: 2, day: 28, hour: 23, minute: 45 };
    const iso = clinicPartsToUtcIso(parts);
    expect(utcIsoToClinicParts(iso)).toEqual(parts);
  });
});

describe("clinicDateKey", () => {
  it("groups an evening UTC instant into the next clinic-local day", () => {
    expect(clinicDateKey("2026-03-05T19:00:00.000Z")).toBe("2026-03-06");
  });

  it("groups the fixture instant into its own clinic-local day", () => {
    expect(clinicDateKey("2026-03-05T03:30:00.000Z")).toBe("2026-03-05");
  });
});

describe("dateKeyToUtcIsoAtMidnight / clinicDayRange", () => {
  it("clinic midnight on 2026-03-05 is 2026-03-04T18:30:00.000Z", () => {
    expect(dateKeyToUtcIsoAtMidnight("2026-03-05")).toBe("2026-03-04T18:30:00.000Z");
  });

  it("produces a 24-hour [from, to) range", () => {
    const range = clinicDayRange("2026-03-05");
    expect(range).toEqual({
      from: "2026-03-04T18:30:00.000Z",
      to: "2026-03-05T18:30:00.000Z",
    });
    const hours = (new Date(range.to).getTime() - new Date(range.from).getTime()) / 3_600_000;
    expect(hours).toBe(24);
  });
});

describe("addDaysToDateKey", () => {
  it("rolls over a month boundary", () => {
    expect(addDaysToDateKey("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("rolls over a year boundary going backwards", () => {
    expect(addDaysToDateKey("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("week helpers", () => {
  it("isoWeekdayIndex treats Monday as 0 and Sunday as 6", () => {
    expect(isoWeekdayIndex("2026-03-02")).toBe(0); // Monday
    expect(isoWeekdayIndex("2026-03-08")).toBe(6); // Sunday
  });

  it("startOfWeekDateKey finds the Monday of the week", () => {
    expect(startOfWeekDateKey("2026-03-05")).toBe("2026-03-02");
    expect(startOfWeekDateKey("2026-03-08")).toBe("2026-03-02");
  });

  it("weekDateKeys returns exactly 7 consecutive days starting Monday", () => {
    const keys = weekDateKeys("2026-03-05");
    expect(keys).toEqual([
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
    ]);
  });

  it("weekdayKeyForDateKey maps to the working-hours DTO's day keys", () => {
    expect(weekdayKeyForDateKey("2026-03-02")).toBe("mon");
    expect(weekdayKeyForDateKey("2026-03-08")).toBe("sun");
  });
});

describe("monthGridDateKeys", () => {
  it("returns a whole number of Monday-start weeks covering the month", () => {
    const keys = monthGridDateKeys("2026-03-15");
    expect(keys.length % 7).toBe(0);
    expect(keys).toContain("2026-03-01");
    expect(keys).toContain("2026-03-31");
    // Grid always starts on a Monday and ends on a Sunday.
    expect(isoWeekdayIndex(keys[0])).toBe(0);
    expect(isoWeekdayIndex(keys[keys.length - 1])).toBe(6);
  });
});

describe("minutesSinceClinicMidnight", () => {
  it("computes the offset used to position calendar-grid rows", () => {
    expect(minutesSinceClinicMidnight("2026-03-05T03:30:00.000Z")).toBe(9 * 60);
  });
});

describe("formatClinicTime", () => {
  it("renders the fixture instant as 9:00 am, not the raw UTC hour", () => {
    expect(formatClinicTime("2026-03-05T03:30:00.000Z")).toBe("9:00 am");
  });
});
