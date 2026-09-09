import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "quiet";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-sage-deep text-paper-raised hover:bg-sage",
  quiet: "border-line text-ink hover:bg-paper border",
};

/**
 * The one button in the CRM. Variants exist so the same 44px tap target,
 * disabled treatment and focus ring apply everywhere rather than being retyped
 * per screen.
 */
export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClassName} ${variantClassName[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
