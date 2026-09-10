import type { AppointmentStatus } from "@/lib/api/admin/appointments";

const statusLabel: Record<AppointmentStatus, string> = {
  booked: "Booked",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

// Text carries the status on its own — colour is reinforcement, never the only signal.
const statusClassName: Record<AppointmentStatus, string> = {
  booked: "border-sage-deep text-sage-deep",
  completed: "border-line text-ink-soft",
  cancelled: "border-clay text-clay",
  no_show: "border-clay text-clay",
};

export function StatusBadge({ status }: { status: string }) {
  const knownStatus = (Object.keys(statusLabel) as AppointmentStatus[]).includes(
    status as AppointmentStatus,
  )
    ? (status as AppointmentStatus)
    : undefined;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
        knownStatus ? statusClassName[knownStatus] : "border-line text-ink-soft"
      }`}
    >
      {knownStatus ? statusLabel[knownStatus] : status}
    </span>
  );
}
