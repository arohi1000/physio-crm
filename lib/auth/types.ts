/**
 * The auth contract as `physio-api` serves it. Hand-written for Milestone 1
 * because the API has not published an `openapi.json` yet; once
 * `npm run generate:api-types` can run, these come from
 * `lib/api/generated/schema.ts` instead.
 */
export type AuthRole = "doctor_admin" | "staff";

export type AuthUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: AuthRole;
};

export type AuthSession = {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly user: AuthUser;
};
