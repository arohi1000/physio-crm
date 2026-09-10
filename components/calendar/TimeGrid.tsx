import { AppointmentChip } from "@/components/calendar/AppointmentChip";
import { BlockChip } from "@/components/calendar/BlockChip";
import { HOUR_LABELS, ROW_HEIGHT_REM, gridTotalRem } from "@/components/calendar/gridLayout";
import type { AdminAppointmentListItem } from "@/lib/api/admin/appointments";
import type { AvailabilityBlock } from "@/lib/api/admin/availabilityBlocks";
import {
  clinicDateKey,
  clinicTodayDateKey,
  formatDateKeyDayNumber,
  formatDateKeyWeekdayShort,
} from "@/lib/time/clinicTime";

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${period}`;
}

/**
 * The day and week views share this grid so the same hour rows, chip layout
 * and click targets appear in both — a week is just several day columns side
 * by side. Booked appointments (`AppointmentChip`, solid fill) and blocked
 * time (`BlockChip`, hatched fill) are visually distinct at a glance, which
 * is the calendar's core requirement (M2-CONTRACT.md).
 */
export function TimeGrid({
  dateKeys,
  appointments,
  blocks,
  onSelectAppointment,
  onSelectBlock,
}: {
  dateKeys: readonly string[];
  appointments: readonly AdminAppointmentListItem[];
  blocks: readonly AvailabilityBlock[];
  onSelectAppointment: (id: string) => void;
  onSelectBlock: (block: AvailabilityBlock) => void;
}) {
  const todayKey = clinicTodayDateKey();
  const totalRem = gridTotalRem();

  return (
    <div className="border-line bg-paper-raised flex overflow-x-auto rounded-lg border">
      <div className="border-line shrink-0 border-r" style={{ width: "3.5rem" }}>
        <div className="border-line h-10 border-b" />
        {HOUR_LABELS.map((hour) => (
          <div
            key={hour}
            style={{ height: `${ROW_HEIGHT_REM}rem` }}
            className="text-ink-soft border-line -translate-y-2 border-t px-1 text-right text-xs first:border-t-0"
          >
            {formatHourLabel(hour)}
          </div>
        ))}
      </div>

      {dateKeys.map((dateKey) => {
        const dayAppointments = appointments.filter((a) => clinicDateKey(a.startsAt) === dateKey);
        const dayBlocks = blocks.filter((b) => clinicDateKey(b.startsAt) === dateKey);
        const isToday = dateKey === todayKey;

        return (
          <div key={dateKey} className="border-line min-w-32 flex-1 border-r last:border-r-0">
            <div
              className={`border-line flex h-10 flex-col items-center justify-center border-b text-xs ${
                isToday ? "bg-paper text-sage-deep font-semibold" : "text-ink-soft"
              }`}
            >
              <span>{formatDateKeyWeekdayShort(dateKey)}</span>
              <span>{formatDateKeyDayNumber(dateKey)}</span>
            </div>
            <div className="relative" style={{ height: `${totalRem}rem` }}>
              {HOUR_LABELS.map((hour, index) => (
                <div
                  key={hour}
                  style={{ top: `${index * ROW_HEIGHT_REM}rem` }}
                  className="border-line absolute inset-x-0 border-t first:border-t-0"
                />
              ))}
              {dayBlocks.map((block) => (
                <BlockChip key={block.id} block={block} onSelect={onSelectBlock} />
              ))}
              {dayAppointments.map((appointment) => (
                <AppointmentChip
                  key={appointment.id}
                  appointment={appointment}
                  onSelect={onSelectAppointment}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
