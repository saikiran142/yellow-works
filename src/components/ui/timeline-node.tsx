import clsx from "clsx";
import type { ReactNode } from "react";

export type NodeState = "idle" | "running" | "done" | "error";

const ring: Record<NodeState, string> = {
  idle: "border-border text-muted",
  running: "border-signal text-text",
  done: "border-ok/50 text-text",
  error: "border-ember/60 text-text",
};

/** Workflow-canvas / timeline node with a mono timestamp. State is conveyed by icon + text, not colour alone. */
export function TimelineNode({ title, time, state = "idle", stateLabel, children }: { title: string; time?: string; state?: NodeState; stateLabel?: string; children?: ReactNode }): React.JSX.Element {
  const label = stateLabel ?? { idle: "Waiting", running: "Running", done: "Done", error: "Needs attention" }[state];
  return (
    <div className={clsx("rounded-card border bg-surface p-4 transition-colors duration-300 ease-out", ring[state])}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-display font-semibold text-text">{title}</p>
        {time && <span className="mono text-muted">{time}</span>}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs">
        <span aria-hidden="true" className={clsx(state === "done" && "text-ok", state === "error" && "text-ember", state === "running" && "live-dot size-2 rounded-full bg-signal")}>
          {state === "done" ? "✓" : state === "error" ? "⚑" : state === "idle" ? "○" : ""}
        </span>
        {label}
      </p>
      {children && <div className="mt-3 text-sm text-muted">{children}</div>}
    </div>
  );
}
