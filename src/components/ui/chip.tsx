import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

/** Suggested-question / filter chip. */
export function Chip({
  selected = false,
  className,
  ...rest
}: { selected?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={clsx(
        "min-h-10 rounded-full border px-4 text-sm transition-colors duration-200 ease-out disabled:pointer-events-none disabled:opacity-50",
        selected ? "border-transparent bg-signal text-signal-ink" : "border-border bg-surface text-text hover:border-muted",
        className,
      )}
    />
  );
}
