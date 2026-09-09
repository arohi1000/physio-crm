import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function ActivityLogPage() {
  return (
    <PlaceholderPage
      title="Activity log"
      milestone="Milestone 7"
      summary="The read-only audit trail of every mutation. doctor_admin only."
      plannedWork={[
        "Filter by user, action, entity and date",
        "Read-only — entries are never editable from the CRM",
      ]}
    />
  );
}
