"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

/** Mono count-up. Respects reduced motion by rendering the final value immediately. */
export function CountUp({ to, durationMs = 1200, suffix = "", className }: { to: number; durationMs?: number; suffix?: string; className?: string }): React.JSX.Element {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const p = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);

  return (
    <span className={clsx("mono tabular-nums", className)}>
      {value}
      {suffix}
    </span>
  );
}

/** Static mono readout, e.g. "replied in 00:06 s". */
export function MonoStat({ label, value, live = false }: { label: string; value: string; live?: boolean }): React.JSX.Element {
  return (
    <div className="inline-flex items-baseline gap-3 rounded-sm border border-border bg-surface px-4 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className={clsx("mono text-lg font-semibold", live ? "text-signal" : "text-text")} aria-live={live ? "polite" : undefined}>
        {value}
      </span>
    </div>
  );
}
