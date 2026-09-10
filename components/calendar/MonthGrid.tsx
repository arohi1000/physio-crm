import type { AdminAppointmentListItem } from "@/lib/api/admin/appointments";
import type { AvailabilityBlock } from "@/lib/api/admin/availabilityBlocks";
import { clinicDateKey, formatDateKeyDayNumber, isSameDateKey } from "@/lib/time/clinicTime";

const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A month is too dense for per-slot positioning, so each cell shows a count and a blocked-day marker instead — click through to Day for detail. */
export function MonthGrid({
  monthDateKey,
  gridDateKeys,
  appointments,
  blocks,
  todayKey,
  onSelectDay,
}: {
  monthDateKey: string;
  gridDateKeys: readonly string[];
  appointments: readonly AdminAppointmentListItem[];
  blocks: readonly AvailabilityBlock[];
  todayKey: string;
  onSelectDay: (dateKey: string) => void;
}) {
  const currentMonth = monthDateKey.slice(0, 7);

  return (
    <div className="border-line bg-paper-raised overflow-hidden rounded-lg border">
      <div className="border-line grid grid-cols-7 border-b text-center">
        {weekdayHeaders.map((label) => (
          <div
            key={label}
            className="text-ink-soft py-2 text-xs font-semibold tracking-widest uppercase"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {gridDateKeys.map((dateKey) => {
          const isCurrentMonth = dateKey.slice(0, 7) === currentMonth;
          const dayAppointments = appointments.filter(
            (a) => clinicDateKey(a.startsAt) === dateKey && a.status !== "cancelled",
          );
          const hasBlock = blocks.some((b) => clinicDateKey(b.startsAt) === dateKey);
          const isToday = isSameDateKey(dateKey, todayKey);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDay(dateKey)}
              className={`border-line flex min-h-24 flex-col items-start gap-1 border-t border-r p-2 text-left last:border-r-0 [&:nth-child(7n)]:border-r-0 ${
                isCurrentMonth ? "" : "bg-paper text-ink-soft"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isToday ? "bg-sage-deep text-paper-raised rounded-full px-1.5 py-0.5" : "text-ink"
                }`}
              >
                {formatDateKeyDayNumber(dateKey)}
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {dayAppointments.length > 0 ? (
                  <span className="border-sage-deep text-sage-deep rounded-full border px-1.5 text-xs">
                    {dayAppointments.length}
                  </span>
                ) : null}
                {hasBlock ? (
                  <span className="border-clay text-clay rounded-full border px-1.5 text-xs">
                    Blocked
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
