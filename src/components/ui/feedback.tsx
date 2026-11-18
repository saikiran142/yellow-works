import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div aria-hidden="true" {...rest} className={clsx("skeleton h-4 w-full", className)} />;
}

type ToastTone = "ok" | "ember" | "info";
const toneClass: Record<ToastTone, string> = { ok: "text-ok", ember: "text-ember", info: "text-ice" };
const toneIcon: Record<ToastTone, string> = { ok: "✓", ember: "⚑", info: "i" };

/** Presentational toast. Wrap in an aria-live region where it is mounted. */
export function Toast({ tone = "info", children }: { tone?: ToastTone; children: ReactNode }): React.JSX.Element {
  return (
    <div role="status" className="glass flex items-center gap-3 rounded-sm px-4 py-3 shadow-float">
      <span aria-hidden="true" className={clsx("font-mono font-semibold", toneClass[tone])}>
        {toneIcon[tone]}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border px-6 py-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title, body, action }: { title: string; body: string; action?: ReactNode }): React.JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-card border border-ember/40 bg-surface px-6 py-10 text-center">
      <p className="flex items-center gap-2 font-display text-lg font-semibold text-ember">
        <span aria-hidden="true">⚑</span>
        {title}
      </p>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

/** Tooltip: CSS-only, shows on hover and keyboard focus of the trigger. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }): React.JSX.Element {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="glass pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm px-3 py-1.5 text-xs opacity-0 shadow-float transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
