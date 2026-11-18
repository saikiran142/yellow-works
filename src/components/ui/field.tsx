import clsx from "clsx";
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const control =
  "w-full min-h-12 rounded-sm border bg-surface px-4 py-3 text-text placeholder:text-muted transition-colors duration-200 ease-out " +
  "hover:border-muted focus-visible:border-ice disabled:opacity-50 disabled:pointer-events-none";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (a: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Label + control + hint/error wiring. Error text is announced and never colour-only. */
export function Field({ label, hint, error, children }: FieldProps): React.JSX.Element {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="flex items-center gap-1.5 text-sm text-ember">
          <span aria-hidden="true">⚑</span>
          {error}
        </p>
      )}
    </div>
  );
}

const border = (invalid: boolean): string => (invalid ? "border-ember" : "border-border");

export function Input({ invalid, className, ...rest }: { invalid?: boolean } & InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return <input aria-invalid={invalid || undefined} {...rest} className={clsx(control, border(Boolean(invalid)), className)} />;
}

export function Textarea({ invalid, className, ...rest }: { invalid?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>): React.JSX.Element {
  return <textarea aria-invalid={invalid || undefined} rows={3} {...rest} className={clsx(control, border(Boolean(invalid)), className)} />;
}

export function Select({ invalid, className, ...rest }: { invalid?: boolean } & SelectHTMLAttributes<HTMLSelectElement>): React.JSX.Element {
  return <select aria-invalid={invalid || undefined} {...rest} className={clsx(control, border(Boolean(invalid)), className)} />;
}
