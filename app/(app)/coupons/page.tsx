import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function CouponsPage() {
  return (
    <PlaceholderPage
      title="Coupons"
      milestone="Milestone 5"
      summary="Discount codes for the public booking flow. doctor_admin only, enforced by the API."
      plannedWork={[
        "Create, edit and deactivate: code, percentage or fixed value, validity window, max uses",
        "Usage count visible per coupon",
        "Deactivation reflected on the public site within the sync window",
      ]}
    />
  );
}
