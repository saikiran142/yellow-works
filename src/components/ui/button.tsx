"use client";

import clsx from "clsx";
import { useRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type PointerEvent, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "ink";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full px-6 min-h-12 font-display text-[0.95rem] font-semibold " +
  "transition-[transform,background-color,border-color,opacity] duration-200 ease-out select-none " +
  "disabled:opacity-50 disabled:pointer-events-none aria-busy:cursor-progress";

const variants: Record<Variant, string> = {
  primary: "bg-signal text-signal-ink hover:brightness-95 active:scale-[0.98]",
  secondary: "bg-surface-2 text-text border border-border hover:border-muted active:scale-[0.98]",
  ghost: "text-text hover:bg-surface-2 active:scale-[0.98]",
  /** For use on a signal-coloured band: dark fill, signal text. */
  ink: "bg-signal-ink text-signal hover:opacity-90 active:scale-[0.98]",
};

interface Common {
  variant?: Variant;
  loading?: boolean;
  /** Pulls the button toward the pointer on fine-pointer devices. Primary only. */
  magnetic?: boolean;
  children: ReactNode;
}

function useMagnet(enabled: boolean) {
  const ref = useRef<HTMLElement | null>(null);
  const onMove = (e: PointerEvent<HTMLElement>): void => {
    if (!enabled || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
    el.style.translate = `${dx}px ${dy}px`;
  };
  const onLeave = (): void => {
    if (ref.current) ref.current.style.translate = "";
  };
  return { ref, onMove, onLeave };
}

function Spinner(): React.JSX.Element {
  return <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function Button({
  variant = "primary",
  loading = false,
  magnetic = false,
  className,
  children,
  disabled,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>): React.JSX.Element {
  const m = useMagnet(magnetic && variant === "primary");
  return (
    <button
      {...rest}
      ref={m.ref as React.RefObject<HTMLButtonElement>}
      onPointerMove={m.onMove}
      onPointerLeave={m.onLeave}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(base, variants[variant], className)}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  magnetic = false,
  className,
  children,
  ...rest
}: Omit<Common, "loading"> & AnchorHTMLAttributes<HTMLAnchorElement>): React.JSX.Element {
  const m = useMagnet(magnetic && variant === "primary");
  return (
    <a
      {...rest}
      ref={m.ref as React.RefObject<HTMLAnchorElement>}
      onPointerMove={m.onMove}
      onPointerLeave={m.onLeave}
      className={clsx(base, variants[variant], className)}
    >
      {children}
    </a>
  );
}
