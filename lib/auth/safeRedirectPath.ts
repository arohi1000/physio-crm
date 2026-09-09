export const dashboardPath = "/";
export const loginPath = "/login";

/**
 * `?next=` comes off the URL bar, so it is attacker-controlled: anything that
 * is not a path on this app — an absolute URL, a protocol-relative `//host`, or
 * `/login` itself — falls back to the dashboard.
 */
export function safeRedirectPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/")) {
    return dashboardPath;
  }
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return dashboardPath;
  }
  if (
    candidate === loginPath ||
    candidate.startsWith(`${loginPath}/`) ||
    candidate.startsWith(`${loginPath}?`)
  ) {
    return dashboardPath;
  }
  return candidate;
}
