"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { ApiError } from "@/lib/api/ApiError";
import { updatePatient, type PatientDetail } from "@/lib/api/admin/patients";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";

type Gender = "female" | "male" | "other" | "";

export function EditPatientDialog({
  request,
  patient,
  onSaved,
  onClose,
}: {
  request: AuthorizedRequest;
  patient: PatientDetail;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone);
  const [email, setEmail] = useState(patient.email ?? "");
  const [dob, setDob] = useState(patient.dob ?? "");
  const [gender, setGender] = useState<Gender>((patient.gender as Gender) ?? "");
  const [notes, setNotes] = useState(patient.notes ?? "");

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
      await updatePatient(request, patient.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        dob: dob || null,
        gender: gender || null,
        notes: notes.trim() || null,
      });
      onSaved();
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
    <Dialog title="Edit patient details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="edit-patient-name">
            <TextInput
              id="edit-patient-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field label="Phone" htmlFor="edit-patient-phone">
            <TextInput
              id="edit-patient-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </Field>
          <Field label="Email (optional)" htmlFor="edit-patient-email">
            <TextInput
              id="edit-patient-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Date of birth (optional)" htmlFor="edit-patient-dob">
            <TextInput
              id="edit-patient-dob"
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </Field>
          <Field label="Gender (optional)" htmlFor="edit-patient-gender">
            <Select
              id="edit-patient-gender"
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
          htmlFor="edit-patient-notes"
          hint="Never shown to the patient."
        >
          <Textarea
            id="edit-patient-notes"
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
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
