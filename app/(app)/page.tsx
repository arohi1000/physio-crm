import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function TodayDashboardPage() {
  return (
    <PlaceholderPage
      title="Today"
      milestone="Milestone 2"
      summary="The landing surface. Today's appointments in time order, each with its one-click actions, so the doctor's common moves are never more than two clicks away."
      plannedWork={[
        "Today's appointments in time order with inline cancel, complete and no-show actions",
        "Counts for follow-ups due, failed messages needing attention, and bookings since last sign-in",
        "Failed messages surfaced prominently with a one-click resend (Milestone 4)",
      ]}
    />
  );
}
