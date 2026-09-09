import { ApiError } from "@/lib/api/ApiError";

/**
 * A refused sign-in is almost always an email that was never provisioned or an
 * account that has been deactivated, and the person reading the screen can do
 * nothing about either except ask the doctor. So the 401 message is fixed text,
 * never the API's or Google's own wording — those leak allow-list detail and
 * read as a bug rather than a decision.
 */
export function describeSignInFailure(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong signing in. Please try again.";
  }

  if (error.status === 401 || error.status === 403) {
    return "This account doesn't have access — contact the doctor.";
  }

  if (error.kind === "network" || error.kind === "timeout") {
    return "Couldn't reach the clinic server. Check your connection and try again.";
  }

  return "Something went wrong signing in. Please try again.";
}
