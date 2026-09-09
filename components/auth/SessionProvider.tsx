"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AccessTokenHolder } from "@/lib/auth/AccessTokenHolder";
import { getCurrentUser, postLogout } from "@/lib/auth/authRequests";
import { createAuthorizedRequester } from "@/lib/auth/authorizedRequester";
import {
  SessionContext,
  type SessionContextValue,
  type SessionState,
} from "@/lib/auth/SessionContext";
import { loginPath } from "@/lib/auth/safeRedirectPath";
import type { AuthSession } from "@/lib/auth/types";
import { useIdleTimeout } from "@/lib/auth/useIdleTimeout";

import { IdleWarningDialog } from "./IdleWarningDialog";

/**
 * Owns the session for the whole app.
 *
 * The access token lives in a ref — memory the moment the tab closes, and never
 * `localStorage` or `sessionStorage` (TRD §7.3). A reload therefore starts with
 * no token and re-earns one from the httpOnly refresh cookie, which is why
 * every load begins in `restoring`.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken] = useState(() => new AccessTokenHolder());
  const [state, setState] = useState<SessionState>({ status: "restoring" });

  const adoptSession = useCallback(
    (session: AuthSession) => {
      accessToken.replace(session.accessToken);
      setState({ status: "authenticated", user: session.user });
    },
    [accessToken],
  );

  const forgetSession = useCallback(() => {
    accessToken.clear();
    setState({ status: "anonymous" });
  }, [accessToken]);

  const { request, restoreSession } = useMemo(
    () =>
      createAuthorizedRequester({
        getAccessToken: () => accessToken.read(),
        onSessionRefreshed: adoptSession,
        onSessionExpired: () => {
          forgetSession();
          router.replace(loginPath);
        },
      }),
    [accessToken, adoptSession, forgetSession, router],
  );

  const signOut = useCallback(async () => {
    // The cookie is the API's to clear, but a network failure must not strand
    // someone in a session they asked to leave, so local state goes either way.
    await postLogout().catch(() => undefined);
    forgetSession();
    router.replace(loginPath);
  }, [forgetSession, router]);

  useEffect(() => {
    let isMounted = true;

    restoreSession().then(
      (session) => {
        if (isMounted) {
          adoptSession(session);
        }
      },
      () => {
        if (isMounted) {
          setState({ status: "anonymous" });
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [adoptSession, restoreSession]);

  const isAuthenticated = state.status === "authenticated";

  const { secondsUntilIdle, extendSession } = useIdleTimeout({
    isEnabled: isAuthenticated,
    onIdle: () => void signOut(),
  });

  // "I'm still here" is also the moment to find out whether the API agrees: if
  // the session died while the tab sat idle, this surfaces it now rather than
  // on the doctor's next click.
  const confirmStillSignedIn = useCallback(() => {
    extendSession();
    void getCurrentUser(request).catch(() => undefined);
  }, [extendSession, request]);

  const value = useMemo<SessionContextValue>(
    () => ({ state, request, adoptSession, signOut }),
    [state, request, adoptSession, signOut],
  );

  return (
    <SessionContext value={value}>
      {children}
      {isAuthenticated && secondsUntilIdle !== null ? (
        <IdleWarningDialog
          secondsRemaining={secondsUntilIdle}
          onStaySignedIn={confirmStillSignedIn}
          onSignOut={() => void signOut()}
        />
      ) : null}
    </SessionContext>
  );
}
