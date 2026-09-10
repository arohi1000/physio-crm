import { minutesSinceClinicMidnight } from "@/lib/time/clinicTime";

/** Shared by the day and week views so both grids line up hour-for-hour. */
export const GRID_START_HOUR = 6;
export const GRID_END_HOUR = 22;
export const ROW_HEIGHT_REM = 3.5;
export const HOUR_LABELS = Array.from(
  { length: GRID_END_HOUR - GRID_START_HOUR },
  (_, index) => GRID_START_HOUR + index,
);

export function gridTotalRem(): number {
  return (GRID_END_HOUR - GRID_START_HOUR) * ROW_HEIGHT_REM;
}

/**
 * Vertical position and height for an event spanning `startIso`..`endIso`,
 * clamped to the visible [GRID_START_HOUR, GRID_END_HOUR) window. Returned in
 * `rem` so the grid scales with the user's base font size rather than a fixed
 * pixel count.
 */
export function eventLayout(
  startIso: string,
  endIso: string,
): { topRem: number; heightRem: number } {
  const gridStartMinutes = GRID_START_HOUR * 60;
  const gridEndMinutes = GRID_END_HOUR * 60;
  const startMinutes = Math.min(
    Math.max(minutesSinceClinicMidnight(startIso), gridStartMinutes),
    gridEndMinutes,
  );
  const rawEndMinutes = minutesSinceClinicMidnight(endIso);
  // An event ending exactly at/after local midnight (minutesSinceClinicMidnight wraps to
  // a small number) is clamped to the grid's bottom edge rather than read as near-zero.
  const endMinutes =
    rawEndMinutes < startMinutes
      ? gridEndMinutes
      : Math.min(Math.max(rawEndMinutes, gridStartMinutes), gridEndMinutes);

  const topRem = ((startMinutes - gridStartMinutes) / 60) * ROW_HEIGHT_REM;
  const heightRem = Math.max(((endMinutes - startMinutes) / 60) * ROW_HEIGHT_REM, 0.75);
  return { topRem, heightRem };
}
