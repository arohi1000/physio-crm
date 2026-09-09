import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiBaseUrl } from "@/lib/api/config";
import { clearMockRefreshToken } from "@/mocks/mockRefreshCookie";
import { server } from "@/mocks/server";

import { getCurrentUser, postDevSignIn } from "./authRequests";
import { createAuthorizedRequester } from "./authorizedRequester";
import type { AuthSession } from "./types";

const doctorEmail = "doctor@physioclinic.local";
/** An access token the mock API does not recognise — the stand-in for an expired one. */
const expiredToken = "mock-access.usr_gone.0";
const requestedPaths: string[] = [];

function recordRequestPaths() {
  server.events.on("request:start", ({ request }) => {
    requestedPaths.push(new URL(request.url).pathname);
  });
}

beforeEach(() => {
  clearMockRefreshToken();
  requestedPaths.length = 0;
  recordRequestPaths();
});

afterEach(() => {
  server.events.removeAllListeners();
});

describe("createAuthorizedRequester", () => {
  it("restores a session from the refresh cookie, and asks only once when called twice", async () => {
    await postDevSignIn(doctorEmail);
    requestedPaths.length = 0;

    const { restoreSession } = createAuthorizedRequester({
      getAccessToken: () => undefined,
      onSessionRefreshed: vi.fn(),
      onSessionExpired: vi.fn(),
    });

    const [first, second] = await Promise.all([restoreSession(), restoreSession()]);

    expect(first.user.email).toBe(doctorEmail);
    expect(second).toBe(first);
    expect(requestedPaths).toEqual(["/api/v1/auth/refresh"]);
  });

  it("refreshes once and retries the original request after a 401", async () => {
    await postDevSignIn(doctorEmail);
    const onSessionRefreshed = vi.fn<(session: AuthSession) => void>();
    const onSessionExpired = vi.fn();

    const { request } = createAuthorizedRequester({
      getAccessToken: () => expiredToken,
      onSessionRefreshed,
      onSessionExpired,
    });

    await expect(getCurrentUser(request)).resolves.toMatchObject({ email: doctorEmail });

    expect(requestedPaths).toEqual([
      "/api/v1/auth/dev-login",
      "/api/v1/auth/me",
      "/api/v1/auth/refresh",
      "/api/v1/auth/me",
    ]);
    expect(onSessionRefreshed).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("hard-logs-out when the refresh itself is rejected, without retrying", async () => {
    const onSessionExpired = vi.fn();

    const { request } = createAuthorizedRequester({
      getAccessToken: () => expiredToken,
      onSessionRefreshed: vi.fn(),
      onSessionExpired,
    });

    await expect(getCurrentUser(request)).rejects.toMatchObject({ status: 401 });

    expect(requestedPaths).toEqual(["/api/v1/auth/me", "/api/v1/auth/refresh"]);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("shares one refresh between requests that fail at the same time", async () => {
    await postDevSignIn(doctorEmail);

    const { request } = createAuthorizedRequester({
      getAccessToken: () => expiredToken,
      onSessionRefreshed: vi.fn(),
      onSessionExpired: vi.fn(),
    });

    await Promise.all([getCurrentUser(request), getCurrentUser(request)]);

    expect(requestedPaths.filter((path) => path.endsWith("/refresh"))).toHaveLength(1);
  });

  it("passes a non-401 failure straight through without refreshing", async () => {
    server.use(
      http.get(`${apiBaseUrl}/api/v1/auth/me`, () => new HttpResponse(null, { status: 500 })),
    );
    const onSessionExpired = vi.fn();

    const { request } = createAuthorizedRequester({
      getAccessToken: () => "mock-access.usr_doctor.0",
      onSessionRefreshed: vi.fn(),
      onSessionExpired,
    });

    await expect(getCurrentUser(request)).rejects.toMatchObject({ kind: "http", status: 500 });

    expect(requestedPaths).toEqual(["/api/v1/auth/me"]);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
