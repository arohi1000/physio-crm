"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { SlotPicker } from "@/components/appointments/SlotPicker";
import { Dialog } from "@/components/ui/Dialog";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { updateAppointment } from "@/lib/api/admin/appointments";
import { ApiError } from "@/lib/api/ApiError";
import type { Slot } from "@/lib/api/public/availability";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import { clinicDateKey, clinicTodayDateKey } from "@/lib/time/clinicTime";

type RescheduleAppointmentDialogProps = {
  request: AuthorizedRequest;
  appointment: {
    id: string;
    startsAt: string;
    service: { id: string; name: string };
    patient: { name: string };
  };
  onRescheduled: () => void;
  onClose: () => void;
};

/** Reschedule is a slot pick + PATCH, held to the same conflict rules as a public booking (M2-CONTRACT.md §3). */
export function RescheduleAppointmentDialog({
  request,
  appointment,
  onRescheduled,
  onClose,
}: RescheduleAppointmentDialogProps) {
  const [date, setDate] = useState(clinicDateKey(appointment.startsAt));
  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [pickerKey, setPickerKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  function onDateChange(next: string) {
    setDate(next);
    setSelectedSlot(undefined);
  }

  async function handleSubmit() {
    if (!selectedSlot) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      await updateAppointment(request, appointment.id, { startsAt: selectedSlot.startsAt });
      onRescheduled();
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "SLOT_UNAVAILABLE") {
        setError("That time was just taken by another booking. Pick a different time.");
        setSelectedSlot(undefined);
        setPickerKey((key) => key + 1);
      } else if (cause instanceof ApiError && cause.code === "SLOT_OUTSIDE_AVAILABILITY") {
        setError("That time isn't bookable — outside working hours or blocked.");
      } else {
        setError("That didn't go through. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      title="Reschedule appointment"
      description={`${appointment.patient.name} · ${appointment.service.name}`}
      onClose={onClose}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        <SlotPicker
          key={pickerKey}
          serviceId={appointment.service.id}
          date={date}
          onDateChange={onDateChange}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          minDate={clinicTodayDateKey()}
        />

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={!selectedSlot || isSubmitting}
            onClick={() => void handleSubmit()}
            className="sm:flex-1"
          >
            {isSubmitting ? "Rescheduling…" : "Confirm new time"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Back out
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
