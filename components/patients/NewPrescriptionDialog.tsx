"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { DocumentPdfButton } from "@/components/patients/DocumentPdfButton";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import {
  createPrescription,
  getPrescriptionPdf,
  type PrescriptionDetail,
  type PrescriptionExercise,
  type PrescriptionMedicine,
} from "@/lib/api/admin/prescriptions";
import type { TimelineAppointmentItem } from "@/lib/api/admin/patients";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";

const emptyMedicine: PrescriptionMedicine = { name: "", dose: "", frequency: "", durationDays: 1 };
const emptyExercise: PrescriptionExercise = { name: "", sets: 1, reps: 1, notes: null };

/** Structured medicines/exercises, not one big textarea (M3-CONTRACT.md §4). */
export function NewPrescriptionDialog({
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
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([{ ...emptyMedicine }]);
  const [exercises, setExercises] = useState<PrescriptionExercise[]>([{ ...emptyExercise }]);
  const [instructions, setInstructions] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<PrescriptionDetail>();

  function updateMedicine(index: number, patch: Partial<PrescriptionMedicine>) {
    setMedicines((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  function updateExercise(index: number, patch: Partial<PrescriptionExercise>) {
    setExercises((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  const cleanedMedicines = medicines.filter((row) => row.name.trim() !== "");
  const cleanedExercises = exercises.filter((row) => row.name.trim() !== "");
  const canSubmit =
    instructions.trim() !== "" && (cleanedMedicines.length > 0 || cleanedExercises.length > 0);

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      const prescription = await createPrescription(request, patientId, {
        medicines: cleanedMedicines,
        exercises: cleanedExercises,
        instructions: instructions.trim(),
        appointmentId: appointmentId || null,
      });
      setSaved(prescription);
    } catch {
      setError("That didn't go through. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (saved) {
    return (
      <Dialog title="Prescription issued" onClose={onSaved} size="sm">
        <div className="flex flex-col gap-4">
          <InlineAlert tone="success" title="Saved to the patient's record" />
          <DocumentPdfButton
            label="View prescription PDF"
            fetchUrl={() => getPrescriptionPdf(request, saved.id)}
          />
          <Button onClick={onSaved} className="sm:flex-1">
            Done
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title="New prescription" onClose={onClose} size="lg">
      <div className="flex flex-col gap-5">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        {appointments.length > 0 ? (
          <Field label="Linked appointment (optional)" htmlFor="prescription-appointment">
            <Select
              id="prescription-appointment"
              value={appointmentId}
              onChange={(event) => setAppointmentId(event.target.value)}
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-ink text-sm font-semibold">Medicines</h3>
            <Button
              variant="quiet"
              onClick={() => setMedicines((rows) => [...rows, { ...emptyMedicine }])}
            >
              Add medicine
            </Button>
          </div>
          {medicines.map((medicine, index) => (
            <div
              key={index}
              className="border-line grid gap-2 rounded-md border p-3 sm:grid-cols-5"
            >
              <TextInput
                aria-label="Medicine name"
                placeholder="Name"
                value={medicine.name}
                onChange={(event) => updateMedicine(index, { name: event.target.value })}
                className="sm:col-span-2"
              />
              <TextInput
                aria-label="Dose"
                placeholder="Dose, e.g. 400mg"
                value={medicine.dose}
                onChange={(event) => updateMedicine(index, { dose: event.target.value })}
              />
              <TextInput
                aria-label="Frequency"
                placeholder="Frequency"
                value={medicine.frequency}
                onChange={(event) => updateMedicine(index, { frequency: event.target.value })}
              />
              <div className="flex gap-2">
                <TextInput
                  aria-label="Duration in days"
                  type="number"
                  min={1}
                  placeholder="Days"
                  value={medicine.durationDays}
                  onChange={(event) =>
                    updateMedicine(index, { durationDays: Number(event.target.value) || 1 })
                  }
                />
                <Button
                  variant="quiet"
                  onClick={() =>
                    setMedicines((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
                  }
                  aria-label="Remove medicine"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-ink text-sm font-semibold">Exercises</h3>
            <Button
              variant="quiet"
              onClick={() => setExercises((rows) => [...rows, { ...emptyExercise }])}
            >
              Add exercise
            </Button>
          </div>
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="border-line grid gap-2 rounded-md border p-3 sm:grid-cols-5"
            >
              <TextInput
                aria-label="Exercise name"
                placeholder="Name"
                value={exercise.name}
                onChange={(event) => updateExercise(index, { name: event.target.value })}
                className="sm:col-span-2"
              />
              <TextInput
                aria-label="Sets"
                type="number"
                min={1}
                placeholder="Sets"
                value={exercise.sets}
                onChange={(event) =>
                  updateExercise(index, { sets: Number(event.target.value) || 1 })
                }
              />
              <TextInput
                aria-label="Reps"
                type="number"
                min={1}
                placeholder="Reps"
                value={exercise.reps}
                onChange={(event) =>
                  updateExercise(index, { reps: Number(event.target.value) || 1 })
                }
              />
              <div className="flex gap-2">
                <TextInput
                  aria-label="Exercise notes"
                  placeholder="Notes (optional)"
                  value={exercise.notes ?? ""}
                  onChange={(event) => updateExercise(index, { notes: event.target.value || null })}
                />
                <Button
                  variant="quiet"
                  onClick={() =>
                    setExercises((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
                  }
                  aria-label="Remove exercise"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Field label="Instructions" htmlFor="prescription-instructions">
          <Textarea
            id="prescription-instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Ice for 10 minutes after each session."
            required
          />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
            className="sm:flex-1"
          >
            {isSubmitting ? "Saving…" : "Save prescription"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
