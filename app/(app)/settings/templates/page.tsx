import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function MessageTemplatesSettingsPage() {
  return (
    <PlaceholderPage
      title="Message templates"
      milestone="Milestone 4"
      summary="The text of every automated message, edited with a live preview so nothing is ever sent blind."
      plannedWork={[
        "Edit body text per template with a live preview using sample data",
        "Validation rejecting unknown placeholders",
        "Warning that WhatsApp-approved template structure cannot change without re-approval",
      ]}
    />
  );
}
