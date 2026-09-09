import { PlaceholderPage } from "@/components/PlaceholderPage";

/**
 * Deliberately outside the `(app)` route group: the shell assumes a session and
 * this page is what you see without one.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <PlaceholderPage
        title="Sign in"
        milestone="Milestone 1"
        summary="Google Identity Services returns an ID token, the CRM posts it to POST /auth/google, and the API replies with our own session. No authentication is wired up yet."
        plannedWork={[
          "Sign in with Google as the only route in for normal users",
          "A discreet password fallback for the break-glass admin account",
          "A plain 'this account doesn't have access — contact the doctor' message for an unprovisioned email, never a raw Google error",
          "Refresh token in an httpOnly cookie; access token held in memory only",
        ]}
      />
    </div>
  );
}
