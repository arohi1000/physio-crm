import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function ReviewsPage() {
  return (
    <PlaceholderPage
      title="Reviews"
      milestone="Milestone 5"
      summary="Patient reviews as they appear on the public site, and control over which surface first."
      plannedWork={[
        "Add, edit and hide reviews: rating, comment, patient name, optional photo via presigned upload",
        "Ordering control for what surfaces first on the homepage",
      ]}
    />
  );
}
