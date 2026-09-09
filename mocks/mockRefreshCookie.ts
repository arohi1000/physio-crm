const cookieName = "msw_mock_refresh";
const cookieMaxAgeSeconds = 60 * 60 * 24;

let nodeCookieValue: string | undefined;

/**
 * Stands in for the API's httpOnly refresh cookie.
 *
 * The real cookie is set by `Set-Cookie` on a real response and is invisible to
 * JavaScript. A service-worker-synthesised response cannot set one, so the mock
 * keeps its own cookie instead, and stores an opaque account id — never an
 * email or a name. It exists so a page reload still restores a session in mock
 * mode; **no application code reads it**, only these handlers.
 *
 * Under Vitest there is no `document`, so the same store falls back to module
 * state, which each test file resets.
 */
export function readMockRefreshToken(): string | undefined {
  if (typeof document === "undefined") {
    return nodeCookieValue;
  }

  const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${cookieName}=`));

  return match?.slice(cookieName.length + 1) || undefined;
}

export function writeMockRefreshToken(value: string): void {
  if (typeof document === "undefined") {
    nodeCookieValue = value;
    return;
  }
  document.cookie = `${cookieName}=${value}; path=/; max-age=${cookieMaxAgeSeconds}; SameSite=Lax`;
}

export function clearMockRefreshToken(): void {
  if (typeof document === "undefined") {
    nodeCookieValue = undefined;
    return;
  }
  document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax`;
}
