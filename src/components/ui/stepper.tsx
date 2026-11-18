import clsx from "clsx";

/** Progress indicator for multi-step forms. `current` is 0-based. */
export function Stepper({ steps, current }: { steps: string[]; current: number }): React.JSX.Element {
  return (
    <nav aria-label="Progress">
      <p className="mono mb-3 text-muted">
        Step {current + 1} of {steps.length} · {steps[current]}
      </p>
      <ol className="flex gap-2">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === current ? "step" : undefined} className="flex-1">
            <span className="sr-only">{`${s}: ${i < current ? "done" : i === current ? "current" : "to do"}`}</span>
            <span aria-hidden="true" className={clsx("block h-1.5 rounded-full transition-colors duration-300 ease-out", i <= current ? "bg-signal" : "bg-surface-2")} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
