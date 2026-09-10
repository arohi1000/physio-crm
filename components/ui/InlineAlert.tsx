import type { ReactNode } from "react";

type AlertTone = "info" | "success" | "warning" | "error";

type InlineAlertProps = {
  tone: AlertTone;
  title: string;
  children?: ReactNode;
};

/**
 * No toast system exists yet in this shell, and the moments that most need
 * feedback here — the overlap warning, a 409 on a stale slot, a cancel
 * confirmation — read better sitting in place than flashing and disappearing.
 * Tone never carries meaning alone: each variant pairs its colour with a label.
 */
const toneClassName: Record<AlertTone, string> = {
  info: "border-line bg-paper text-ink",
  success: "border-sage-deep bg-paper text-ink",
  warning: "border-clay bg-paper text-ink",
  error: "border-clay bg-paper text-ink",
};

const toneLabel: Record<AlertTone, string> = {
  info: "Note",
  success: "Done",
  warning: "Warning",
  error: "Error",
};

export function InlineAlert({ tone, title, children }: InlineAlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border p-3 ${toneClassName[tone]}`}
    >
      <p className="text-xs font-semibold tracking-widest uppercase" data-tone={tone}>
        {toneLabel[tone]}
      </p>
      <p className="mt-1 text-sm font-medium">{title}</p>
      {children ? <div className="text-ink-soft mt-1 text-sm">{children}</div> : null}
    </div>
  );
}
