import clsx from "clsx";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  legend: string;
  options: readonly Option<T>[];
  /** "one" renders radios, "many" renders checkboxes. */
  mode: "one" | "many";
  value: T | T[] | undefined;
  onChange: (next: T | T[]) => void;
  error?: string;
  name: string;
  hint?: string;
}

/** Card-style radio / checkbox group with proper fieldset semantics and a visible focus ring. */
export function ChoiceGroup<T extends string>({ legend, options, mode, value, onChange, error, name, hint }: Props<T>): React.JSX.Element {
  const selected = (v: T): boolean => (mode === "many" ? Array.isArray(value) && value.includes(v) : value === v);
  const toggle = (v: T): void => {
    if (mode === "one") return onChange(v);
    const cur = Array.isArray(value) ? value : [];
    onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };
  return (
    <fieldset aria-describedby={error ? `${name}-err` : undefined} className="flex flex-col gap-3">
      <legend className="mb-1 font-display text-xl font-semibold">{legend}</legend>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={clsx(
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-colors duration-200 ease-out focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--c-focus)]",
              selected(o.value) ? "border-signal bg-surface-2" : "border-border bg-surface hover:border-muted",
            )}
          >
            <input type={mode === "one" ? "radio" : "checkbox"} name={name} value={o.value} checked={selected(o.value)} onChange={() => toggle(o.value)} className="sr-only" />
            <span aria-hidden="true" className={clsx("grid size-5 shrink-0 place-items-center border text-xs", mode === "one" ? "rounded-full" : "rounded-md", selected(o.value) ? "border-transparent bg-signal text-signal-ink" : "border-muted")}>
              {selected(o.value) ? "✓" : ""}
            </span>
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-err`} role="alert" className="flex items-center gap-1.5 text-sm text-ember">
          <span aria-hidden="true">⚑</span>
          {error}
        </p>
      )}
    </fieldset>
  );
}
