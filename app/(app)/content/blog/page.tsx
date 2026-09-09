import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function BlogListPage() {
  return (
    <PlaceholderPage
      title="Blog"
      milestone="Milestone 5"
      summary="Posts published from here appear on the public website within the sync window."
      plannedWork={[
        "List posts with draft and published state",
        "Create a post, and open the draft preview link on the website",
      ]}
    />
  );
}
