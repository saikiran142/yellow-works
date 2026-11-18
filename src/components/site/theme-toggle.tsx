"use client";

import { useEffect, useState } from "react";

import { dict } from "@/content/i18n";

type Theme = "dark" | "light";

/** Visible theme toggle. Persists to localStorage (per-viewer convenience only). */
export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const toggle = (): void => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = (): void => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    try {
      localStorage.setItem("tyw-theme", next);
    } catch {
      /* storage unavailable; theme still applies for this visit */
    }
    if (typeof document.startViewTransition === "function") document.startViewTransition(apply);
    else apply();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? dict.theme.toLight : dict.theme.toDark}
      className="grid size-10 place-items-center rounded-full border border-border bg-surface text-text transition-colors duration-200 ease-out hover:border-muted"
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
