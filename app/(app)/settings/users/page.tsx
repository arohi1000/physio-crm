import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function UsersSettingsPage() {
  return (
    <PlaceholderPage
      title="Users"
      milestone="Milestone 7"
      summary="The Google email allow-list. An address that is not listed here cannot sign in, whoever owns it. doctor_admin only."
      plannedWork={[
        "Provision a staff member by Google email address, assign role, deactivate",
        "Manage the break-glass password account",
      ]}
    />
  );
}
