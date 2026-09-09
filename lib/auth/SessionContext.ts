"use client";

import { createContext } from "react";

import type { AuthorizedRequest } from "./authorizedRequester";
import type { AuthSession, AuthUser } from "./types";

/**
 * `restoring` is the state that stops a login flash: on every load the app asks
 * the API to restore the session from the refresh cookie, and until that
 * answers, neither the shell nor the login form may be shown.
 */
export type SessionState =
  | { readonly status: "restoring" }
  | { readonly status: "anonymous" }
  | { readonly status: "authenticated"; readonly user: AuthUser };

export type SessionContextValue = {
  readonly state: SessionState;
  /** The only way to call an authenticated endpoint: adds the token, refreshes once on a 401. */
  readonly request: AuthorizedRequest;
  readonly adoptSession: (session: AuthSession) => void;
  readonly signOut: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);
