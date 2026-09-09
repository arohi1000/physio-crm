import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function BlogPostEditorPage() {
  return (
    <PlaceholderPage
      title="Blog post"
      milestone="Milestone 5"
      summary="The editor for a single post, with a save confirmation that names where the post appears publicly."
      plannedWork={[
        "Markdown or sanitized rich-text editor with cover image",
        "Slug editing with a uniqueness check",
        "Draft versus published toggle and preview link",
      ]}
    />
  );
}
