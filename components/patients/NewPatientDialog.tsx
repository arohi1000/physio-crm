"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { ApiError } from "@/lib/api/ApiError";
import { createPatient } from "@/lib/api/admin/patients";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";

type Gender = "female" | "male" | "other" | "";

/** Manual/walk-in add — the doctor or front desk registering someone at the counter. */
export function NewPatientDialog({
  request,
  onCreated,
  onClose,
}: {
  request: AuthorizedRequest;
  onCreated: (patientId: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [notes, setNotes] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const canSubmit = name.trim() !== "" && phone.trim() !== "";

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      const patient = await createPatient(request, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        dob: dob || null,
        gender: gender || null,
        notes: notes.trim() || null,
        consentGiven,
      });
      onCreated(patient.id);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "PATIENT_PHONE_TAKEN") {
        setError("Another patient already holds that phone number.");
      } else {
        setError("That didn't go through. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      title="Add patient"
      description="For a walk-in or phone registration."
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="new-patient-name">
            <TextInput
              id="new-patient-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field label="Phone" htmlFor="new-patient-phone">
            <TextInput
              id="new-patient-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+919876543210"
              required
            />
          </Field>
          <Field label="Email (optional)" htmlFor="new-patient-email">
            <TextInput
              id="new-patient-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Date of birth (optional)" htmlFor="new-patient-dob">
            <TextInput
              id="new-patient-dob"
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </Field>
          <Field label="Gender (optional)" htmlFor="new-patient-gender">
            <Select
              id="new-patient-gender"
              value={gender}
              onChange={(event) => setGender(event.target.value as Gender)}
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Internal note (optional)"
          htmlFor="new-patient-notes"
          hint="Never shown to the patient."
        >
          <Textarea
            id="new-patient-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(event) => setConsentGiven(event.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-ink">Patient has consented to treatment and data processing.</span>
        </label>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
            className="sm:flex-1"
          >
            {isSubmitting ? "Adding…" : "Add patient"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
