"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { LoadingScreen } from "@/components/LoadingScreen";
import { signInWithGoogle } from "@/lib/auth/googleSignIn";
import { safeRedirectPath } from "@/lib/auth/safeRedirectPath";
import { describeSignInFailure } from "@/lib/auth/signInFailure";
import type { AuthSession } from "@/lib/auth/types";
import { useSession } from "@/lib/auth/useSession";

import { DevSignInPanel } from "./DevSignInPanel";
import { PasswordSignInForm } from "./PasswordSignInForm";

const isDevelopment = process.env.NODE_ENV !== "production";

export function SignInPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, adoptSession } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const destination = safeRedirectPath(searchParams.get("next"));

  // Covers both halves of "arriving already signed in": a fresh sign-in below,
  // and a reload whose silent refresh restored a session.
  useEffect(() => {
    if (state.status === "authenticated") {
      router.replace(destination);
    }
  }, [state.status, destination, router]);

  const attemptSignIn = useCallback(
    async (signIn: () => Promise<AuthSession>) => {
      setIsPending(true);
      setErrorMessage(null);
      try {
        adoptSession(await signIn());
      } catch (error) {
        setErrorMessage(describeSignInFailure(error));
        setIsPending(false);
      }
    },
    [adoptSession],
  );

  if (state.status !== "anonymous") {
    return <LoadingScreen message="Restoring your session…" />;
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink text-2xl font-semibold">Physio CRM</h1>
        <p className="text-ink-soft text-sm">Clinic administration. Staff accounts only.</p>
      </header>

      <div className="border-line bg-paper-raised flex flex-col gap-4 rounded-lg border p-6">
        <Button onClick={() => void attemptSignIn(signInWithGoogle)} disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in with Google"}
        </Button>

        {errorMessage ? (
          <p role="alert" className="text-clay text-sm">
            {errorMessage}
          </p>
        ) : null}

        <PasswordSignInForm isPending={isPending} onSubmit={attemptSignIn} />
      </div>

      {isDevelopment ? <DevSignInPanel isPending={isPending} onSelect={attemptSignIn} /> : null}
    </div>
  );
}
