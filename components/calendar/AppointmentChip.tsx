import { eventLayout } from "@/components/calendar/gridLayout";
import type { AdminAppointmentListItem } from "@/lib/api/admin/appointments";
import { formatClinicTime } from "@/lib/time/clinicTime";

const statusToneClassName: Record<string, string> = {
  booked: "bg-sage-deep text-paper-raised border-sage-deep",
  completed: "bg-paper text-ink-soft border-line",
  cancelled: "bg-paper text-ink-soft border-line line-through opacity-70",
  no_show: "bg-paper text-clay border-clay",
};

/**
 * A booked appointment. Solid fill distinguishes it from a hatched
 * availability block at a glance, per M2-CONTRACT.md's calendar requirement —
 * colour is reinforced by fill style, not the only signal.
 */
export function AppointmentChip({
  appointment,
  onSelect,
}: {
  appointment: AdminAppointmentListItem;
  onSelect: (id: string) => void;
}) {
  const { topRem, heightRem } = eventLayout(appointment.startsAt, appointment.endsAt);
  const toneClassName = statusToneClassName[appointment.status] ?? statusToneClassName.booked;

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment.id)}
      // Position is per-event data computed at render time — this is exactly the
      // "genuinely dynamic value" inline styles are reserved for.
      style={{ top: `${topRem}rem`, height: `${heightRem}rem` }}
      className={`absolute inset-x-0.5 overflow-hidden rounded border px-1.5 py-0.5 text-left text-xs leading-tight shadow-sm ${toneClassName}`}
      title={`${appointment.patient.name} · ${appointment.service.name}`}
    >
      <span className="block font-semibold">{formatClinicTime(appointment.startsAt)}</span>
      <span className="block truncate">{appointment.patient.name}</span>
    </button>
  );
}
