"use client";

import { useState } from "react";

import { CancelAppointmentDialog } from "@/components/appointments/CancelAppointmentDialog";
import { updateAppointment } from "@/lib/api/admin/appointments";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";

/** The minimal shape every action needs — deliberately looser than any one DTO so both the list and detail shapes satisfy it. */
export type ActionableAppointment = {
  id: string;
  status: string;
  startsAt: string;
  patient: { name: string };
};

type AppointmentActionsProps = {
  request: AuthorizedRequest;
  appointment: ActionableAppointment;
  onChanged: () => void;
};

const actionButtonClassName =
  "border-line text-ink hover:bg-paper min-h-9 rounded-md border px-2.5 text-xs font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The doctor's one-click moves on a booked appointment — mark it done, mark a
 * no-show, or cancel it — shared by the Today dashboard, the appointments
 * table and the detail drawer so the three surfaces never drift on what a
 * status change actually does.
 */
export function AppointmentActions({ request, appointment, onChanged }: AppointmentActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState<"completed" | "no_show">();

  if (appointment.status !== "booked") {
    return null;
  }

  async function setStatus(status: "completed" | "no_show") {
    setIsUpdating(status);
    try {
      await updateAppointment(request, appointment.id, { status });
      onChanged();
    } finally {
      setIsUpdating(undefined);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        className={actionButtonClassName}
        disabled={isUpdating !== undefined}
        onClick={() => void setStatus("completed")}
      >
        {isUpdating === "completed" ? "Marking…" : "Complete"}
      </button>
      <button
        type="button"
        className={actionButtonClassName}
        disabled={isUpdating !== undefined}
        onClick={() => void setStatus("no_show")}
      >
        {isUpdating === "no_show" ? "Marking…" : "No-show"}
      </button>
      <button
        type="button"
        className={`${actionButtonClassName} border-clay text-clay`}
        disabled={isUpdating !== undefined}
        onClick={() => setIsCancelling(true)}
      >
        Cancel
      </button>

      {isCancelling ? (
        <CancelAppointmentDialog
          request={request}
          appointment={appointment}
          onCancelled={() => {
            setIsCancelling(false);
            onChanged();
          }}
          onClose={() => setIsCancelling(false)}
        />
      ) : null}
    </div>
  );
}
