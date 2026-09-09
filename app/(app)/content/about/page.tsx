import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function AboutContentPage() {
  return (
    <PlaceholderPage
      title="About"
      milestone="Milestone 5"
      summary="The doctor's bio, credentials, photos and clinic information."
      plannedWork={[
        "Editable bio, credentials and clinic details",
        "Photo management via presigned upload",
        "Save confirmation naming where each field appears publicly",
      ]}
    />
  );
}
