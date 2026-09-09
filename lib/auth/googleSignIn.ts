import { postDevSignIn } from "./authRequests";
import { devPrimaryAccount } from "./devAccounts";
import type { AuthSession } from "./types";

/**
 * The only module that knows how pressing "Sign in with Google" turns into a
 * session. Everything else — the login page, the session, the shell — deals in
 * the `AuthSession` this returns.
 *
 * There is no Google OAuth client yet (EXECUTION-PLAN.md decision B6), so today
 * it calls the API's development bypass and signs in as the doctor account.
 *
 * Replacing it touches this file only: load Google Identity Services with
 * `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, take the ID token from its credential
 * response, and call `postGoogleSignIn(idToken)` — already implemented in
 * `authRequests.ts` and covered by the mock handlers — instead of
 * `postDevSignIn`. No caller changes.
 */
export function signInWithGoogle(): Promise<AuthSession> {
  return postDevSignIn(devPrimaryAccount.email);
}
