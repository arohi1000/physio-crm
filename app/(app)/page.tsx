"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AppointmentActions } from "@/components/appointments/AppointmentActions";
import { StatusBadge } from "@/components/StatusBadge";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { listAllAppointmentsInRange, type AppointmentStatus } from "@/lib/api/admin/appointments";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { useSession } from "@/lib/auth/useSession";
import {
  clinicDayRange,
  clinicTodayDateKey,
  formatClinicTime,
  formatDateKeyLabel,
} from "@/lib/time/clinicTime";

const statusOrder: Record<AppointmentStatus, number> = {
  booked: 0,
  completed: 1,
  no_show: 2,
  cancelled: 3,
};

/**
 * The landing surface (physio-crm-PLAN.md §4). Today's bookings in time
 * order with their one-click actions, so the doctor's most common moves never
 * require leaving this page.
 */
export default function TodayDashboardPage() {
  const { request } = useSession();
  const todayKey = useMemo(() => clinicTodayDateKey(), []);
  const range = useMemo(() => clinicDayRange(todayKey), [todayKey]);

  const { data, error, isLoading, reload } = useApiResource(
    () => listAllAppointmentsInRange(request, { from: range.from, to: range.to }),
    [request, range.from, range.to],
  );

  const appointments = useMemo(() => {
    const items = data ?? [];
    return [...items].sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime() ||
        statusOrder[a.status as AppointmentStatus] - statusOrder[b.status as AppointmentStatus],
    );
  }, [data]);

  const counts = useMemo(() => {
    const tally: Record<AppointmentStatus, number> = {
      booked: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
    for (const appointment of appointments) {
      const status = appointment.status as AppointmentStatus;
      if (status in tally) {
        tally[status] += 1;
      }
    }
    return tally;
  }, [appointments]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink text-2xl font-semibold">Today</h1>
        <p className="text-ink-soft text-sm">{formatDateKeyLabel(todayKey)}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Booked" value={counts.booked} emphasis />
        <StatTile label="Completed" value={counts.completed} />
        <StatTile label="No-show" value={counts.no_show} />
        <StatTile label="Cancelled" value={counts.cancelled} />
      </div>

      {error ? (
        <InlineAlert tone="error" title="Couldn't load today's appointments">
          {error.message}
        </InlineAlert>
      ) : null}

      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading today&rsquo;s appointments…</p>
      ) : appointments.length === 0 ? (
        <p className="border-line bg-paper-raised text-ink-soft rounded-lg border p-6 text-center text-sm">
          Nothing on the books for today.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="border-line bg-paper-raised flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-ink w-16 shrink-0 font-mono text-sm font-semibold">
                  {formatClinicTime(appointment.startsAt)}
                </span>
                <div className="flex flex-col">
                  <Link
                    href={`/appointments?id=${appointment.id}`}
                    className="text-ink text-sm font-semibold hover:underline"
                  >
                    {appointment.patient.name}
                  </Link>
                  <span className="text-ink-soft text-xs">
                    {appointment.service.name} · {appointment.patient.phone}
                  </span>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
              <AppointmentActions request={request} appointment={appointment} onChanged={reload} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div className="border-line bg-paper-raised flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-ink-soft text-xs font-semibold tracking-widest uppercase">{label}</span>
      <span className={`text-2xl font-semibold ${emphasis ? "text-sage-deep" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
