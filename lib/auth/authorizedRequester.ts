import { ApiError } from "@/lib/api/ApiError";
import { apiRequest, type ApiRequestOptions } from "@/lib/api/client";

import { postRefresh } from "./authRequests";
import type { AuthSession } from "./types";

export type AuthorizedRequest = <TResponse>(
  path: string,
  options?: ApiRequestOptions,
) => Promise<TResponse>;

export type AuthorizedRequesterOptions = {
  /** Reads the access token from wherever the session currently holds it — memory, never storage. */
  getAccessToken: () => string | undefined;
  onSessionRefreshed: (session: AuthSession) => void;
  onSessionExpired: () => void;
};

export type AuthorizedRequester = {
  readonly request: AuthorizedRequest;
  /** Trades the httpOnly refresh cookie for a session — used to restore one on load. */
  readonly restoreSession: () => Promise<AuthSession>;
};

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * Wraps `apiRequest` with the two behaviours every authenticated call needs:
 * the bearer token on the way out, and a single silent refresh on a 401 before
 * the original request is retried once. A failed refresh means the session is
 * gone for good, so the caller hard-logs-out rather than looping.
 *
 * A factory rather than a module singleton so the token never becomes module
 * state: the session owns it and hands in a reader.
 */
export function createAuthorizedRequester({
  getAccessToken,
  onSessionRefreshed,
  onSessionExpired,
}: AuthorizedRequesterOptions): AuthorizedRequester {
  let refreshInFlight: Promise<AuthSession> | undefined;

  // Concurrent callers share one refresh: a screen firing three requests at
  // once — or React re-running the restore effect — must not rotate the refresh
  // token three times and invalidate its own session.
  function refreshOnce(): Promise<AuthSession> {
    refreshInFlight ??= postRefresh().finally(() => {
      refreshInFlight = undefined;
    });
    return refreshInFlight;
  }

  async function request<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    try {
      return await apiRequest<TResponse>(path, { ...options, accessToken: getAccessToken() });
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      let session: AuthSession;
      try {
        session = await refreshOnce();
      } catch {
        onSessionExpired();
        throw new ApiError("http", `The session expired while requesting ${path}.`, 401);
      }

      onSessionRefreshed(session);

      try {
        return await apiRequest<TResponse>(path, {
          ...options,
          accessToken: session.accessToken,
        });
      } catch (retryError) {
        // A 401 on a token minted seconds ago means the account itself lost
        // access. Refreshing again would only produce the same answer.
        if (isUnauthorized(retryError)) {
          onSessionExpired();
        }
        throw retryError;
      }
    }
  }

  return { request, restoreSession: refreshOnce };
}
