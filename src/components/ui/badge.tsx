import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "signal" | "ice" | "ember" | "ok";

// ember/ok sit on `surface`, never `surface-2` (light theme AA rule; see scripts/contrast.mjs).
const tones: Record<Tone, string> = {
  neutral: "bg-surface text-muted border-border",
  signal: "bg-signal text-signal-ink border-transparent",
  ice: "bg-surface text-ice border-border",
  ember: "bg-surface text-ember border-ember/40",
  ok: "bg-surface text-ok border-ok/40",
};

const icons: Partial<Record<Tone, string>> = { ok: "✓", ember: "⚑" };

/** Status badge. Colour is never the only signal: ok/ember always carry an icon and a label. */
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }): React.JSX.Element {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", tones[tone], className)}>
      {icons[tone] && <span aria-hidden="true">{icons[tone]}</span>}
      {children}
    </span>
  );
}
