import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function AppointmentsPage() {
  return (
    <PlaceholderPage
      title="Appointments"
      milestone="Milestone 2"
      summary="The filterable appointment table and the cancel flow — the single most important interaction in the CRM."
      plannedWork={[
        "Filter by status, date range and service; search by patient",
        "Detail drawer: patient, service, price, coupon, payment status, source, history",
        "Cancel flow with a fully rendered message preview that updates live before anything is sent",
        "Mark completed / no-show, reschedule, and manual booking for phone and walk-in patients",
      ]}
    />
  );
}
