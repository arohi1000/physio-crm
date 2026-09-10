"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineAlert } from "@/components/ui/InlineAlert";

type ConfirmDialogProps = {
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: "default" | "destructive";
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

/**
 * Every destructive action in the CRM (§ EXECUTION-PLAN.md 4.7) is confirmed
 * before it fires — this is the one place that confirmation happens, so the
 * pending state, the error surface and the "confirm" copy are consistent
 * everywhere it is used.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(undefined);
    try {
      await onConfirm();
    } catch {
      setError("That didn't go through. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog title={title} description={description} onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            autoFocus
            disabled={isSubmitting}
            onClick={() => void handleConfirm()}
            className={`sm:flex-1 ${tone === "destructive" ? "bg-clay hover:bg-clay" : ""}`}
          >
            {isSubmitting ? "Working…" : confirmLabel}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Back out
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
