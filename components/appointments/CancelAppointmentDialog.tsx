"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import type { ActionableAppointment } from "@/components/appointments/AppointmentActions";
import { cancelAppointment } from "@/lib/api/admin/appointments";
import { ApiError } from "@/lib/api/ApiError";
import { formatClinicDateLabel, formatClinicTime } from "@/lib/time/clinicTime";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";

type CancelAppointmentDialogProps = {
  request: AuthorizedRequest;
  appointment: ActionableAppointment;
  onCancelled: () => void;
  onClose: () => void;
};

/**
 * The single most important interaction in this milestone's scope. Messaging
 * is Milestone 4 — this dialog must not imply a WhatsApp send happens, so it
 * says plainly that none does, and that the slot reopens immediately.
 */
export function CancelAppointmentDialog({
  request,
  appointment,
  onCancelled,
  onClose,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      await cancelAppointment(request, appointment.id, reason.trim());
      onCancelled();
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.code === "APPOINTMENT_NOT_CANCELLABLE"
          ? "This appointment is already cancelled or completed, so it can't be cancelled again."
          : "That didn't go through. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      title="Cancel this appointment?"
      description={`${appointment.patient.name} · ${formatClinicDateLabel(appointment.startsAt)} at ${formatClinicTime(appointment.startsAt)}`}
      onClose={onClose}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <InlineAlert tone="warning" title="No message is sent">
          Messaging is not part of this build yet — the patient is not notified automatically. The
          slot becomes bookable again immediately.
        </InlineAlert>

        <Field label="Reason for cancelling" htmlFor="cancel-reason" error={error}>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Doctor unwell, rescheduling on request"
            required
          />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            className="bg-clay hover:bg-clay sm:flex-1"
          >
            {isSubmitting ? "Cancelling…" : "Cancel appointment"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Keep appointment
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
