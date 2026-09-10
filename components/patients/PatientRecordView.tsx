"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";
import { EditPatientDialog } from "@/components/patients/EditPatientDialog";
import { LogFollowUpDialog } from "@/components/patients/LogFollowUpDialog";
import { NewPrescriptionDialog } from "@/components/patients/NewPrescriptionDialog";
import { NewReceiptDialog } from "@/components/patients/NewReceiptDialog";
import { PatientTimeline } from "@/components/patients/PatientTimeline";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { deletePatient, getPatient, type TimelineAppointmentItem } from "@/lib/api/admin/patients";
import { useSession } from "@/lib/auth/useSession";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { formatClinicDateLabel } from "@/lib/time/clinicTime";

type ActiveDialog = "edit" | "follow-up" | "prescription" | "receipt" | "delete" | undefined;

export function PatientRecordView({ patientId }: { patientId: string }) {
  const { request, state } = useSession();
  const router = useRouter();
  const canDelete = state.status === "authenticated" && state.user.role === "doctor_admin";

  const [activeDialog, setActiveDialog] = useState<ActiveDialog>();

  const {
    data: patient,
    error,
    isLoading,
    reload,
  } = useApiResource(() => getPatient(request, patientId), [request, patientId]);

  function closeDialog() {
    setActiveDialog(undefined);
  }

  function closeAndReload() {
    setActiveDialog(undefined);
    reload();
  }

  if (isLoading) {
    return <p className="text-ink-soft text-sm">Loading patient…</p>;
  }

  if (error || !patient) {
    return (
      <InlineAlert tone="error" title="Couldn't load this patient">
        {error?.message ?? "The patient could not be found."}
      </InlineAlert>
    );
  }

  const appointments = patient.timeline.filter(
    (item): item is TimelineAppointmentItem => item.kind === "appointment",
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="border-line flex flex-col gap-4 rounded-md border p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-ink text-2xl font-semibold">{patient.name}</h1>
            <p className="text-ink-soft text-sm">
              {patient.phone} {patient.email ? `· ${patient.email}` : ""}
            </p>
            <p className="text-ink-soft text-xs">
              {patient.dob ? `DOB ${patient.dob} · ` : ""}
              {patient.gender ? `${patient.gender} · ` : ""}Source: {patient.source} · Added{" "}
              {formatClinicDateLabel(patient.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="quiet" onClick={() => setActiveDialog("edit")}>
              Edit details
            </Button>
            {canDelete ? (
              <Button
                variant="quiet"
                className="border-clay text-clay"
                onClick={() => setActiveDialog("delete")}
              >
                Delete patient
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setActiveDialog("follow-up")}>Log follow-up</Button>
          <Button onClick={() => setActiveDialog("prescription")}>New prescription</Button>
          <Button onClick={() => setActiveDialog("receipt")}>New receipt</Button>
        </div>

        <div>
          <h2 className="text-ink-soft text-xs font-semibold tracking-widest uppercase">
            Internal note
          </h2>
          <p className="text-ink text-sm">{patient.notes || "No note on file."}</p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-ink text-lg font-semibold">History</h2>
        <PatientTimeline request={request} timeline={patient.timeline} />
      </section>

      {activeDialog === "edit" ? (
        <EditPatientDialog
          request={request}
          patient={patient}
          onSaved={closeAndReload}
          onClose={closeDialog}
        />
      ) : null}

      {activeDialog === "follow-up" ? (
        <LogFollowUpDialog
          request={request}
          patientId={patient.id}
          onSaved={closeAndReload}
          onClose={closeDialog}
        />
      ) : null}

      {activeDialog === "prescription" ? (
        <NewPrescriptionDialog
          request={request}
          patientId={patient.id}
          appointments={appointments}
          onSaved={closeAndReload}
          onClose={closeDialog}
        />
      ) : null}

      {activeDialog === "receipt" ? (
        <NewReceiptDialog
          request={request}
          patientId={patient.id}
          appointments={appointments}
          onSaved={closeAndReload}
          onClose={closeDialog}
        />
      ) : null}

      {activeDialog === "delete" ? (
        <ConfirmDialog
          title="Delete this patient?"
          description="This removes them from search and lists. Their history is kept for records."
          confirmLabel="Delete patient"
          tone="destructive"
          onConfirm={async () => {
            await deletePatient(request, patient.id);
            router.push("/patients");
          }}
          onClose={closeDialog}
        />
      ) : null}
    </div>
  );
}
