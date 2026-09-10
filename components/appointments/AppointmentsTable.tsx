"use client";

import { StatusBadge } from "@/components/StatusBadge";
import type { AdminAppointmentListItem } from "@/lib/api/admin/appointments";
import { formatClinicDateLabel, formatClinicTime } from "@/lib/time/clinicTime";

const sourceLabel: Record<string, string> = {
  website: "Website",
  admin: "Manual",
  phone: "Phone",
};

/** Dense but readable (EXECUTION-PLAN.md §4.6): every row is one appointment, no wrapped multi-line cells. */
export function AppointmentsTable({
  appointments,
  onSelect,
}: {
  appointments: readonly AdminAppointmentListItem[];
  onSelect: (id: string) => void;
}) {
  if (appointments.length === 0) {
    return (
      <p className="border-line bg-paper-raised text-ink-soft rounded-lg border p-6 text-center text-sm">
        No appointments match these filters.
      </p>
    );
  }

  return (
    <div className="border-line bg-paper-raised overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-line text-ink-soft border-b text-xs font-semibold tracking-widest uppercase">
            <th scope="col" className="px-4 py-3">
              Date &amp; time
            </th>
            <th scope="col" className="px-4 py-3">
              Patient
            </th>
            <th scope="col" className="px-4 py-3">
              Service
            </th>
            <th scope="col" className="px-4 py-3">
              Price
            </th>
            <th scope="col" className="px-4 py-3">
              Payment
            </th>
            <th scope="col" className="px-4 py-3">
              Source
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr
              key={appointment.id}
              tabIndex={0}
              role="button"
              onClick={() => onSelect(appointment.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(appointment.id);
                }
              }}
              className="border-line hover:bg-paper focus-visible:bg-paper cursor-pointer border-b last:border-b-0"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-ink font-medium">{formatClinicTime(appointment.startsAt)}</div>
                <div className="text-ink-soft text-xs">
                  {formatClinicDateLabel(appointment.startsAt)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-ink font-medium">{appointment.patient.name}</div>
                <div className="text-ink-soft text-xs">{appointment.patient.phone}</div>
              </td>
              <td className="px-4 py-3">{appointment.service.name}</td>
              <td className="px-4 py-3 font-mono whitespace-nowrap">₹{appointment.priceCharged}</td>
              <td className="px-4 py-3 capitalize">{appointment.paymentStatus}</td>
              <td className="px-4 py-3">
                {sourceLabel[appointment.bookingSource] ?? appointment.bookingSource}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={appointment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
