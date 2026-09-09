import type { AuthRole } from "./types";

export type DevAccount = {
  readonly email: string;
  readonly name: string;
  readonly role: AuthRole;
};

/**
 * The seeded accounts the API's dev bypass accepts, so role-specific UI can be
 * exercised without a Google OAuth client. Everything that renders these is
 * gated on `NODE_ENV !== "production"`. The addresses themselves still reach a
 * production bundle, because the Google button's bypass references one of them
 * — which is another reason decision B6 is tracked debt, not a design choice.
 */
const devDoctorAccount: DevAccount = {
  email: "doctor@physioclinic.local",
  name: "Dr. Meera Sharma",
  role: "doctor_admin",
};

const devStaffAccount: DevAccount = {
  email: "staff@physioclinic.local",
  name: "Priya Nair",
  role: "staff",
};

export const devAccounts: readonly DevAccount[] = [devDoctorAccount, devStaffAccount];

/** Who the "Sign in with Google" button signs in as while the bypass stands in for Google. */
export const devPrimaryAccount: DevAccount = devDoctorAccount;

/** Not on the allow-list, so the dev panel can demonstrate the refusal path. */
export const devUnprovisionedEmail = "not-provisioned@example.com";
