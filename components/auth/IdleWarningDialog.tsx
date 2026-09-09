"use client";

import { Button } from "@/components/Button";

type IdleWarningDialogProps = {
  secondsRemaining: number;
  onStaySignedIn: () => void;
  onSignOut: () => void;
};

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Deliberately blocking. Patient data on an unattended screen is the risk this
 * exists to close, so the prompt sits above everything and is answered rather
 * than dismissed by a passing mouse.
 */
export function IdleWarningDialog({
  secondsRemaining,
  onStaySignedIn,
  onSignOut,
}: IdleWarningDialogProps) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-description"
      className="bg-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="border-line bg-paper-raised flex w-full max-w-sm flex-col gap-4 rounded-lg border p-6 shadow-lg">
        <h2 id="idle-warning-title" className="text-ink text-lg font-semibold">
          Still there?
        </h2>
        <p id="idle-warning-description" className="text-ink-soft text-sm">
          You&rsquo;ll be signed out in{" "}
          <span className="text-ink font-mono font-semibold" aria-live="polite">
            {formatCountdown(secondsRemaining)}
          </span>{" "}
          because this screen has been idle.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          {/* Autofocused so a keyboard user answers with Enter, and so focus
              leaves whatever was behind the overlay. */}
          <Button autoFocus onClick={onStaySignedIn} className="sm:flex-1">
            Stay signed in
          </Button>
          <Button variant="quiet" onClick={onSignOut} className="sm:flex-1">
            Sign out now
          </Button>
        </div>
      </div>
    </div>
  );
}
