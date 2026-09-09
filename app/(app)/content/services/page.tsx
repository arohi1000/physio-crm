import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function ServicesContentPage() {
  return (
    <PlaceholderPage
      title="Services"
      milestone="Milestone 5"
      summary="The service catalogue that drives both the public site and slot computation."
      plannedWork={[
        "Name, description, price, duration, demo video URL and active toggle",
        "Explicit warning that a duration change affects slot computation",
      ]}
    />
  );
}
