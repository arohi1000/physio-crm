import { Button } from "@/components/Button";
import type { CalendarView } from "@/components/calendar/types";
import {
  addDaysToDateKey,
  clinicTodayDateKey,
  formatDateKeyLabel,
  formatDateKeyMonthYear,
  startOfWeekDateKey,
  weekDateKeys,
} from "@/lib/time/clinicTime";

const views: { value: CalendarView; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const stepDays: Record<CalendarView, number> = { day: 1, week: 7, month: 30 };

function titleFor(view: CalendarView, dateKey: string): string {
  if (view === "day") return formatDateKeyLabel(dateKey);
  if (view === "month") return formatDateKeyMonthYear(dateKey);
  const week = weekDateKeys(dateKey);
  return `${formatDateKeyLabel(week[0])} – ${formatDateKeyLabel(week[6])}`;
}

export function CalendarToolbar({
  view,
  dateKey,
  onViewChange,
  onDateChange,
  onCreateBlock,
}: {
  view: CalendarView;
  dateKey: string;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (dateKey: string) => void;
  onCreateBlock: () => void;
}) {
  function step(direction: 1 | -1) {
    if (view === "month") {
      const [year, month] = dateKey.split("-").map(Number);
      const next = new Date(Date.UTC(year, month - 1 + direction, 1));
      onDateChange(
        `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`,
      );
      return;
    }
    onDateChange(addDaysToDateKey(dateKey, stepDays[view] * direction));
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous"
          className="border-line hover:bg-paper min-h-11 min-w-11 rounded-md border"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() =>
            onDateChange(
              view === "week" ? startOfWeekDateKey(clinicTodayDateKey()) : clinicTodayDateKey(),
            )
          }
          className="border-line hover:bg-paper min-h-11 rounded-md border px-3 text-sm font-medium"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next"
          className="border-line hover:bg-paper min-h-11 min-w-11 rounded-md border"
        >
          ›
        </button>
        <h1 className="text-ink ml-2 text-lg font-semibold">{titleFor(view, dateKey)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div
          role="tablist"
          aria-label="Calendar view"
          className="border-line flex rounded-md border p-0.5"
        >
          {views.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={view === option.value}
              onClick={() => onViewChange(option.value)}
              className={`min-h-9 rounded px-3 text-sm font-medium ${
                view === option.value
                  ? "bg-sage-deep text-paper-raised"
                  : "text-ink-soft hover:bg-paper"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button onClick={onCreateBlock}>Block time</Button>
      </div>
    </div>
  );
}
