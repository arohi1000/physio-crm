import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function PatientRecordPage() {
  return (
    <PlaceholderPage
      title="Patient record"
      milestone="Milestone 3"
      summary="One page, one timeline — what makes a returning patient's history legible in seconds."
      plannedWork={[
        "Header with contact details and quick actions: Book, Log follow-up, New prescription, New receipt",
        "Merged chronological timeline of appointments, follow-ups, prescriptions, receipts and messages sent",
        "Edit details and soft-delete, both doctor_admin and both confirmed",
        "Portal activity and markers showing which documents the patient can already see (Milestone 6)",
      ]}
    />
  );
}
