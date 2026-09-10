"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { DocumentPdfButton } from "@/components/patients/DocumentPdfButton";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { getAppointment } from "@/lib/api/admin/appointments";
import type { TimelineAppointmentItem } from "@/lib/api/admin/patients";
import { ApiError } from "@/lib/api/ApiError";
import { createReceipt, getReceiptPdf, type ReceiptDetail } from "@/lib/api/admin/receipts";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";

type PaymentMethod = "cash" | "online" | "card" | "other";

export function NewReceiptDialog({
  request,
  patientId,
  appointments,
  onSaved,
  onClose,
}: {
  request: AuthorizedRequest;
  patientId: string;
  appointments: readonly TimelineAppointmentItem[];
  onSaved: () => void;
  onClose: () => void;
}) {
  const [appointmentId, setAppointmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [isPrefilling, setIsPrefilling] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<ReceiptDetail>();

  // The amount prefills from the linked appointment's priceCharged
  // (M3-CONTRACT.md §4) — the doctor can still edit it before saving.
  async function onAppointmentChange(nextAppointmentId: string) {
    setAppointmentId(nextAppointmentId);
    if (!nextAppointmentId) {
      return;
    }
    setIsPrefilling(true);
    try {
      const appointment = await getAppointment(request, nextAppointmentId);
      setAmount(appointment.priceCharged);
    } catch {
      // Prefill is a convenience; the doctor can still enter the amount by hand.
    } finally {
      setIsPrefilling(false);
    }
  }

  const parsedAmount = Number(amount);
  const canSubmit = amount.trim() !== "" && Number.isFinite(parsedAmount) && parsedAmount > 0;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      const receipt = await createReceipt(request, patientId, {
        amount,
        paymentMethod,
        appointmentId: appointmentId || null,
        notes: notes.trim() || null,
      });
      setSaved(receipt);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "RECEIPT_AMOUNT_INVALID") {
        setError("Enter an amount greater than zero.");
      } else {
        setError("That didn't go through. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  if (saved) {
    return (
      <Dialog title="Receipt issued" onClose={onSaved} size="sm">
        <div className="flex flex-col gap-4">
          <InlineAlert tone="success" title={saved.number} />
          <DocumentPdfButton
            label="View receipt PDF"
            fetchUrl={() => getReceiptPdf(request, saved.id)}
          />
          <Button onClick={onSaved} className="sm:flex-1">
            Done
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title="New receipt" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        {appointments.length > 0 ? (
          <Field label="Linked appointment (optional)" htmlFor="receipt-appointment">
            <Select
              id="receipt-appointment"
              value={appointmentId}
              onChange={(event) => void onAppointmentChange(event.target.value)}
            >
              <option value="">No linked appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.reference} · {appointment.serviceName}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field
          label="Amount (₹)"
          htmlFor="receipt-amount"
          hint={isPrefilling ? "Filling from the appointment…" : undefined}
        >
          <TextInput
            id="receipt-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </Field>

        <Field label="Payment method" htmlFor="receipt-method">
          <Select
            id="receipt-method"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </Select>
        </Field>

        <Field label="Notes (optional)" htmlFor="receipt-notes">
          <Textarea
            id="receipt-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
            className="sm:flex-1"
          >
            {isSubmitting ? "Saving…" : "Save receipt"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
