"use client";

import { useEffect, useId, type ReactNode } from "react";

type DialogProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** Wider content — the booking wizard and the appointment detail need more room than a confirm prompt. */
  size?: "sm" | "md" | "lg";
};

const sizeClassName: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * The one modal shape in the CRM — confirm prompts, the block dialog, the
 * booking wizard and the appointment drawer's sub-dialogs all sit on this so
 * Escape-to-close, the scrim and focus land in one place. Modeled on
 * `IdleWarningDialog`, generalized with a title/description/children shape.
 */
export function Dialog({ title, description, onClose, children, size = "md" }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="bg-scrim fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`border-line bg-paper-raised flex max-h-[90dvh] w-full flex-col gap-4 rounded-lg border p-6 shadow-lg ${sizeClassName[size]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-ink text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-ink-soft text-sm">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ink-soft hover:bg-paper hover:text-ink flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
