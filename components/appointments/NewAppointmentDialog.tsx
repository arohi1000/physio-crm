"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { SlotPicker } from "@/components/appointments/SlotPicker";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import {
  createAppointment,
  type PaymentPreference,
  type ReasonForVisit,
} from "@/lib/api/admin/appointments";
import { ApiError } from "@/lib/api/ApiError";
import type { Slot } from "@/lib/api/public/availability";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import { useServices } from "@/lib/hooks/useServices";
import { clinicTodayDateKey } from "@/lib/time/clinicTime";

const reasonOptions: { value: ReasonForVisit; label: string }[] = [
  { value: "acute_injury", label: "Acute injury" },
  { value: "persistent_pain", label: "Persistent pain" },
  { value: "post_surgical", label: "Post-surgical" },
  { value: "chronic_condition", label: "Chronic condition" },
  { value: "sports_performance", label: "Sports performance" },
  { value: "general_assessment", label: "General assessment" },
];

const couponErrorMessage: Record<string, string> = {
  COUPON_NOT_FOUND: "No coupon with that code exists.",
  COUPON_EXPIRED: "That coupon has expired.",
  COUPON_INACTIVE: "That coupon is no longer active.",
  COUPON_MAX_USES: "That coupon has reached its usage limit.",
};

/** Manual/walk-in booking, held to the same availability check as the public site (M2-CONTRACT.md §3). */
export function NewAppointmentDialog({
  request,
  onBooked,
  onClose,
}: {
  request: AuthorizedRequest;
  onBooked: () => void;
  onClose: () => void;
}) {
  const { data: services } = useServices();
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(clinicTodayDateKey());
  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [pickerKey, setPickerKey] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState<ReasonForVisit>("general_assessment");
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("clinic");
  const [couponCode, setCouponCode] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  function onServiceChange(next: string) {
    setServiceId(next);
    setSelectedSlot(undefined);
  }

  function onDateChange(next: string) {
    setDate(next);
    setSelectedSlot(undefined);
  }

  const canSubmit =
    serviceId !== "" &&
    selectedSlot !== undefined &&
    name.trim() !== "" &&
    phone.trim() !== "" &&
    consentGiven;

  async function handleSubmit() {
    if (!canSubmit || !selectedSlot) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      await createAppointment(request, {
        serviceId,
        startsAt: selectedSlot.startsAt,
        patient: { name: name.trim(), phone: phone.trim(), email: email.trim() || null },
        reasonForVisit,
        couponCode: couponCode.trim() || null,
        paymentPreference,
        consentGiven,
      });
      onBooked();
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "SLOT_UNAVAILABLE") {
        setError("That time was just taken by another booking. Pick a different time.");
        setSelectedSlot(undefined);
        setPickerKey((key) => key + 1);
      } else if (cause instanceof ApiError && cause.code === "SLOT_OUTSIDE_AVAILABILITY") {
        setError("That time isn't bookable — outside working hours or blocked.");
      } else if (cause instanceof ApiError && cause.code === "CONSENT_REQUIRED") {
        setError("Consent is required to book.");
      } else if (cause instanceof ApiError && cause.code && cause.code in couponErrorMessage) {
        setError(couponErrorMessage[cause.code]);
      } else {
        setError("That didn't go through. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog title="New walk-in / phone booking" onClose={onClose} size="lg">
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        <Field label="Service" htmlFor="new-appt-service">
          <Select
            id="new-appt-service"
            value={serviceId}
            onChange={(event) => onServiceChange(event.target.value)}
          >
            <option value="">Choose a service…</option>
            {(services ?? []).map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.durationMinutes}min · ₹{service.price}
              </option>
            ))}
          </Select>
        </Field>

        {serviceId ? (
          <SlotPicker
            key={pickerKey}
            serviceId={serviceId}
            date={date}
            onDateChange={onDateChange}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            minDate={clinicTodayDateKey()}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient name" htmlFor="new-appt-name">
            <TextInput
              id="new-appt-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field label="Phone" htmlFor="new-appt-phone">
            <TextInput
              id="new-appt-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+919876543210"
              required
            />
          </Field>
          <Field label="Email (optional)" htmlFor="new-appt-email">
            <TextInput
              id="new-appt-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Reason for visit" htmlFor="new-appt-reason">
            <Select
              id="new-appt-reason"
              value={reasonForVisit}
              onChange={(event) => setReasonForVisit(event.target.value as ReasonForVisit)}
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Payment preference" htmlFor="new-appt-payment">
            <Select
              id="new-appt-payment"
              value={paymentPreference}
              onChange={(event) => setPaymentPreference(event.target.value as PaymentPreference)}
            >
              <option value="clinic">Pay at clinic</option>
              <option value="online">Pay online</option>
            </Select>
          </Field>
          <Field label="Coupon code (optional)" htmlFor="new-appt-coupon">
            <TextInput
              id="new-appt-coupon"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            />
          </Field>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(event) => setConsentGiven(event.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-ink">
            Patient has consented to treatment and data processing. Required to book.
          </span>
        </label>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
            className="sm:flex-1"
          >
            {isSubmitting ? "Booking…" : "Book appointment"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
