import { apiRequest } from "@/lib/api/client";

import type { AuthorizedRequest } from "./authorizedRequester";
import type { AuthSession, AuthUser } from "./types";

const authBasePath = "/api/v1/auth";

/**
 * One function per endpoint in the auth contract, and nothing else: no state,
 * no error translation, no redirects. Everything that decides *when* to call
 * these lives in `SessionProvider` or `authorizedRequester`.
 *
 * The refresh token travels as an httpOnly cookie the browser attaches on its
 * own — `apiRequest` sends credentials on every call, so nothing here reads or
 * writes it, which is exactly the point of an httpOnly cookie.
 */
export function postGoogleSignIn(idToken: string): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${authBasePath}/google`, {
    method: "POST",
    body: { idToken },
  });
}

/** Development only. The API registers this route only when its dev bypass is on. */
export function postDevSignIn(email: string): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${authBasePath}/dev-login`, {
    method: "POST",
    body: { email },
  });
}

/** The break-glass admin account. Normal users have no password. */
export function postPasswordSignIn(email: string, password: string): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${authBasePath}/login`, {
    method: "POST",
    body: { email, password },
  });
}

export function postRefresh(): Promise<AuthSession> {
  return apiRequest<AuthSession>(`${authBasePath}/refresh`, { method: "POST" });
}

export function postLogout(): Promise<void> {
  return apiRequest<void>(`${authBasePath}/logout`, { method: "POST" });
}

export function getCurrentUser(request: AuthorizedRequest): Promise<AuthUser> {
  return request<AuthUser>(`${authBasePath}/me`);
}
