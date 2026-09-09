import { http, HttpResponse } from "msw";

import { apiBaseUrl } from "@/lib/api/config";
import type { AuthSession, AuthUser } from "@/lib/auth/types";

import {
  clearMockRefreshToken,
  readMockRefreshToken,
  writeMockRefreshToken,
} from "./mockRefreshCookie";

type MockAccount = AuthUser & {
  readonly isActive: boolean;
  /** Only the break-glass admin has one; everyone else signs in with Google. */
  readonly password?: string;
};

/**
 * The allow-list the API will hold in `users`. An email that is not here — or
 * one whose account is deactivated — is refused, which is the case the login
 * page's "this account doesn't have access" message exists for.
 */
const mockAccounts: readonly MockAccount[] = [
  {
    id: "usr_doctor",
    name: "Dr. Asha Rao",
    email: "doctor@physioclinic.local",
    role: "doctor_admin",
    isActive: true,
  },
  {
    id: "usr_staff",
    name: "Priya Nair",
    email: "staff@physioclinic.local",
    role: "staff",
    isActive: true,
  },
  {
    id: "usr_former_staff",
    name: "Rahul Menon",
    email: "former.staff@physioclinic.local",
    role: "staff",
    isActive: false,
  },
  {
    id: "usr_break_glass",
    name: "Break-glass admin",
    email: "admin@physioclinic.local",
    role: "doctor_admin",
    isActive: true,
    password: "break-glass",
  },
];

const authBaseUrl = `${apiBaseUrl}/api/v1/auth`;
const accessTokenPrefix = "mock-access";
const accessTokenLifetimeSeconds = 900;

/** The API verifies a real Google ID token; the mock only needs to carry an email. */
export const mockGoogleIdTokenPrefix = "mock-google-id-token:";

function unauthorized(message: string) {
  return HttpResponse.json({ statusCode: 401, message, error: "Unauthorized" }, { status: 401 });
}

function findActiveAccount(email: string): MockAccount | undefined {
  const account = mockAccounts.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return account?.isActive ? account : undefined;
}

function toAuthUser({ id, name, email, role }: MockAccount): AuthUser {
  return { id, name, email, role };
}

function issueSession(account: MockAccount): AuthSession {
  writeMockRefreshToken(account.id);
  return {
    accessToken: `${accessTokenPrefix}.${account.id}.${Date.now()}`,
    expiresIn: accessTokenLifetimeSeconds,
    user: toAuthUser(account),
  };
}

function accountFromAccessToken(authorizationHeader: string | null): MockAccount | undefined {
  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : undefined;

  const [prefix, accountId] = token?.split(".") ?? [];
  if (prefix !== accessTokenPrefix) {
    return undefined;
  }

  const account = mockAccounts.find((candidate) => candidate.id === accountId);
  return account?.isActive ? account : undefined;
}

const noAccessMessage = "This account is not provisioned for the clinic CRM.";

export const authHandlers = [
  http.post(`${authBaseUrl}/google`, async ({ request }) => {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken?.startsWith(mockGoogleIdTokenPrefix)) {
      return unauthorized("The Google ID token could not be verified.");
    }

    const account = findActiveAccount(idToken.slice(mockGoogleIdTokenPrefix.length));
    return account ? HttpResponse.json(issueSession(account)) : unauthorized(noAccessMessage);
  }),

  http.post(`${authBaseUrl}/dev-login`, async ({ request }) => {
    const { email } = (await request.json()) as { email?: string };
    const account = email ? findActiveAccount(email) : undefined;
    return account ? HttpResponse.json(issueSession(account)) : unauthorized(noAccessMessage);
  }),

  http.post(`${authBaseUrl}/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as { email?: string; password?: string };
    const account = email ? findActiveAccount(email) : undefined;

    if (!account?.password || account.password !== password) {
      return unauthorized("Those credentials are not valid.");
    }
    return HttpResponse.json(issueSession(account));
  }),

  http.post(`${authBaseUrl}/refresh`, () => {
    const accountId = readMockRefreshToken();
    const account = mockAccounts.find((candidate) => candidate.id === accountId);

    if (!account?.isActive) {
      clearMockRefreshToken();
      return unauthorized("The refresh token is missing or no longer valid.");
    }
    return HttpResponse.json(issueSession(account));
  }),

  http.post(`${authBaseUrl}/logout`, () => {
    clearMockRefreshToken();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${authBaseUrl}/me`, ({ request }) => {
    const account = accountFromAccessToken(request.headers.get("Authorization"));
    return account
      ? HttpResponse.json(toAuthUser(account))
      : unauthorized("The access token is missing or expired.");
  }),
];
