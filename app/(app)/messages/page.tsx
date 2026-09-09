import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function MessagesPage() {
  return (
    <PlaceholderPage
      title="Messages"
      milestone="Milestone 4"
      summary="The outbound message log. Every send in the CRM shows its rendered text before committing; this is where the result lands."
      plannedWork={[
        "Log of type, patient, status, scheduled and sent time, rendered content and failure reason",
        "One-click resend, with a note on the alternate channel once retries are exhausted",
      ]}
    />
  );
}
