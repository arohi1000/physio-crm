"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/Button";
import { postPasswordSignIn } from "@/lib/auth/authRequests";
import type { AuthSession } from "@/lib/auth/types";

type PasswordSignInFormProps = {
  isPending: boolean;
  onSubmit: (signIn: () => Promise<AuthSession>) => Promise<void>;
};

const fieldClassName =
  "border-line bg-paper text-ink min-h-11 rounded-md border px-3 text-sm placeholder:text-ink-soft";

/**
 * Break-glass only: normal users have no password. Collapsed behind a
 * disclosure so it is present without competing with Google for attention —
 * `<details>` keeps that keyboard-operable without any JavaScript of its own.
 */
export function PasswordSignInForm({ isPending, onSubmit }: PasswordSignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(() => postPasswordSignIn(email, password));
  };

  return (
    <details className="border-line border-t pt-4">
      <summary className="text-ink-soft hover:text-ink cursor-pointer list-none text-sm underline underline-offset-4">
        Sign in with password
      </summary>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <p className="text-ink-soft text-xs">
          For the break-glass admin account only. Staff sign in with Google.
        </p>

        <label className="text-ink flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClassName}
          />
        </label>

        <label className="text-ink flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClassName}
          />
        </label>

        <Button type="submit" variant="quiet" disabled={isPending}>
          Sign in
        </Button>
      </form>
    </details>
  );
}
