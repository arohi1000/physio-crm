"use client";

import { postDevSignIn } from "@/lib/auth/authRequests";
import { devAccounts, devUnprovisionedEmail } from "@/lib/auth/devAccounts";
import type { AuthSession } from "@/lib/auth/types";

type DevSignInPanelProps = {
  isPending: boolean;
  onSelect: (signIn: () => Promise<AuthSession>) => Promise<void>;
};

const devButtonClassName =
  "border-clay text-clay hover:bg-paper-raised flex min-h-11 items-center justify-between gap-3 rounded-md border border-dashed px-3 text-left font-mono text-xs disabled:cursor-not-allowed disabled:opacity-60";

/**
 * A development-only shortcut into either role, so role-specific UI can be
 * exercised without a Google OAuth client. Rendered only when
 * `NODE_ENV !== "production"`, and dressed to be unmistakable — dashed clay
 * border, monospace, a stated reason — so it can never read as a real sign-in
 * option. Tracked debt: EXECUTION-PLAN.md decision B6.
 */
export function DevSignInPanel({ isPending, onSelect }: DevSignInPanelProps) {
  return (
    <section
      aria-labelledby="dev-sign-in-title"
      className="border-clay flex flex-col gap-3 rounded-lg border border-dashed p-4"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="dev-sign-in-title"
          className="text-clay font-mono text-xs font-semibold tracking-widest uppercase"
        >
          Development only
        </h2>
        <p className="text-ink-soft text-xs">
          Bypasses Google via <code className="font-mono">POST /auth/dev-login</code>. Never
          rendered in a production build.
        </p>
      </div>

      {devAccounts.map((account) => (
        <button
          key={account.email}
          type="button"
          disabled={isPending}
          onClick={() => void onSelect(() => postDevSignIn(account.email))}
          className={devButtonClassName}
        >
          <span>Sign in as {account.name}</span>
          <span>{account.role}</span>
        </button>
      ))}

      <button
        type="button"
        disabled={isPending}
        onClick={() => void onSelect(() => postDevSignIn(devUnprovisionedEmail))}
        className={devButtonClassName}
      >
        <span>Sign in with an unprovisioned email</span>
        <span>expect refusal</span>
      </button>
    </section>
  );
}
