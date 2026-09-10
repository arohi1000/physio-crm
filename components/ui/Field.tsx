import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const controlClassName =
  "border-line bg-paper text-ink min-h-11 w-full rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Label + control + optional hint/error, the one shape every form control in the CRM uses. */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-ink text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-clay text-xs" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-soft text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClassName} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClassName} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${controlClassName} min-h-20 py-2 ${props.className ?? ""}`} />
  );
}
