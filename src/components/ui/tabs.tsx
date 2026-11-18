"use client";

import clsx from "clsx";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

/** Accessible tabs: roving tabindex, arrow/Home/End keys. */
export function Tabs({ items, label }: { items: TabItem[]; label: string }): React.JSX.Element {
  const uid = useId();
  const [active, setActive] = useState(items[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = items.length - 1;
    const next = e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    const target = items[next];
    if (!target) return;
    setActive(target.id);
    refs.current[target.id]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} className="inline-flex gap-1 rounded-full border border-border bg-surface p-1">
        {items.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={clsx(
              "min-h-10 rounded-full px-5 text-sm font-medium transition-colors duration-200 ease-out",
              active === t.id ? "bg-signal text-signal-ink" : "text-muted hover:text-text",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div key={t.id} role="tabpanel" id={`${uid}-panel-${t.id}`} aria-labelledby={`${uid}-tab-${t.id}`} hidden={active !== t.id} className="pt-6">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
