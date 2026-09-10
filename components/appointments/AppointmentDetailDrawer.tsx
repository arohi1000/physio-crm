"use client";

import { useState } from "react";

import { AppointmentActions } from "@/components/appointments/AppointmentActions";
import { RescheduleAppointmentDialog } from "@/components/appointments/RescheduleAppointmentDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { getAppointment } from "@/lib/api/admin/appointments";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { formatClinicDateLabel, formatClinicTime } from "@/lib/time/clinicTime";

const reasonLabel: Record<string, string> = {
  acute_injury: "Acute injury",
  persistent_pain: "Persistent pain",
  post_surgical: "Post-surgical",
  chronic_condition: "Chronic condition",
  sports_performance: "Sports performance",
  general_assessment: "General assessment",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="text-ink text-right font-medium">{value}</span>
    </div>
  );
}

export function AppointmentDetailDrawer({
  request,
  appointmentId,
  onClose,
  onChanged,
}: {
  request: AuthorizedRequest;
  appointmentId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const {
    data: appointment,
    error,
    isLoading,
    reload,
  } = useApiResource(() => getAppointment(request, appointmentId), [request, appointmentId]);

  function handleChanged() {
    reload();
    onChanged();
  }

  return (
    <Dialog
      title={appointment ? appointment.patient.name : "Appointment"}
      description={appointment?.reference}
      onClose={onClose}
      size="md"
    >
      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading…</p>
      ) : error ? (
        <InlineAlert tone="error" title="Couldn't load this appointment">
          {error.message}
        </InlineAlert>
      ) : appointment ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={appointment.status} />
            <AppointmentActions
              request={request}
              appointment={appointment}
              onChanged={handleChanged}
            />
          </div>

          <div className="border-line divide-line divide-y rounded-md border px-3">
            <Row label="Date" value={formatClinicDateLabel(appointment.startsAt)} />
            <Row
              label="Time"
              value={`${formatClinicTime(appointment.startsAt)} – ${formatClinicTime(appointment.endsAt)}`}
            />
            <Row
              label="Service"
              value={`${appointment.service.name} (${appointment.service.durationMinutes}min)`}
            />
            <Row label="Phone" value={appointment.patient.phone} />
            <Row label="Email" value={appointment.patient.email ?? "—"} />
            <Row
              label="Reason for visit"
              value={reasonLabel[appointment.reasonForVisit] ?? appointment.reasonForVisit}
            />
            <Row label="Source" value={appointment.bookingSource} />
          </div>

          <div className="border-line divide-line divide-y rounded-md border px-3">
            <Row label="Original price" value={`₹${appointment.originalPrice}`} />
            <Row label="Discount" value={`₹${appointment.discountAmount}`} />
            <Row label="Price charged" value={`₹${appointment.priceCharged}`} />
            <Row label="Coupon" value={appointment.couponCode ?? "—"} />
            <Row label="Payment status" value={appointment.paymentStatus} />
            <Row label="Payment preference" value={appointment.paymentPreference} />
          </div>

          {appointment.status === "cancelled" ? (
            <InlineAlert tone="warning" title="Cancelled">
              {appointment.cancellationReason ?? "No reason recorded."}
              {appointment.cancelledBy ? ` — by ${appointment.cancelledBy.name}` : ""}
            </InlineAlert>
          ) : null}

          {appointment.status === "booked" ? (
            <Button variant="quiet" onClick={() => setIsRescheduling(true)}>
              Reschedule
            </Button>
          ) : null}

          {isRescheduling ? (
            <RescheduleAppointmentDialog
              request={request}
              appointment={appointment}
              onRescheduled={() => {
                setIsRescheduling(false);
                handleChanged();
              }}
              onClose={() => setIsRescheduling(false)}
            />
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
