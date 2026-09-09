import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function FollowUpsPage() {
  return (
    <PlaceholderPage
      title="Follow-ups"
      milestone="Milestone 3"
      summary="The follow-up queue, and the guarantee that logging one shows when the reminder sends and what it will say before it is saved."
      plannedWork={[
        "Queue filtered by due soon / reminder sent / rebooked / dismissed",
        "Mark dismissed or rebook directly from the row",
        "Editing a follow-up date visibly reschedules the reminder",
      ]}
    />
  );
}
