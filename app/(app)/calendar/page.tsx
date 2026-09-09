import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function CalendarPage() {
  return (
    <PlaceholderPage
      title="Calendar"
      milestone="Milestone 2"
      summary="Day, week and month views over appointments and availability blocks, with booked time and blocked time visually distinct at a glance."
      plannedWork={[
        "Day / week / month views over GET /admin/appointments and availability-blocks",
        "Create an availability block by dragging or via a dialog, with optional RRULE recurrence",
        "Overlap warning that names the affected bookings and states plainly that they are not cancelled",
      ]}
    />
  );
}
