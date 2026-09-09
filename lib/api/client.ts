import { ApiError } from "./ApiError";
import { apiBaseUrl } from "./config";

const REQUEST_TIMEOUT_MS = 8000;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Held in memory by the session and passed per call; never read from storage. */
  accessToken?: string;
};

function buildHeaders(accessToken: string | undefined): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * The single entry point for talking to `physio-api`. Every failure — offline
 * API, non-2xx status, malformed body — surfaces as an `ApiError`, so no caller
 * has to guard against a raw `fetch` rejection.
 *
 * This function stays stateless. Authenticated screens go through
 * `createAuthorizedRequest` (`lib/auth/authorizedRequester.ts`), which supplies
 * the token and owns the silent-refresh retry; nothing else in the app should
 * call `fetch` against the API directly.
 */
export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", body, signal: callerSignal, accessToken } = options;

  // Combined so a caller-supplied signal cannot silently drop the timeout: an
  // API that accepts the socket but never answers must not pin the caller in a
  // permanent loading state.
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: buildHeaders(accessToken),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: "no-store",
      credentials: "include",
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "TimeoutError") {
      throw new ApiError("timeout", `The API did not respond within ${REQUEST_TIMEOUT_MS}ms.`);
    }
    throw new ApiError("network", `Could not reach the API at ${apiBaseUrl}.`);
  }

  if (!response.ok) {
    throw new ApiError(
      "http",
      `${method} ${path} failed with ${response.status} ${response.statusText}.`,
      response.status,
    );
  }

  // 204 is a documented success shape in the auth contract (logout), not a
  // malformed body.
  if (response.status === 204) {
    return undefined as TResponse;
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    throw new ApiError(
      "parse",
      `${method} ${path} returned a body that is not valid JSON.`,
      response.status,
    );
  }
}
