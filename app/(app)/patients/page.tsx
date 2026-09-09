import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function PatientsPage() {
  return (
    <PlaceholderPage
      title="Patients"
      milestone="Milestone 3"
      summary="Debounced search by name, phone or email, with the columns staff need before picking up the phone."
      plannedWork={[
        "Search by name / phone / email with debounce",
        "Columns for last visit, next appointment and follow-up due",
        "Add patient, for walk-ins recorded at the desk",
      ]}
    />
  );
}
