"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { defaultChips } from "@/lib/demo/scripted";
import { STRINGS } from "@/lib/demo/i18n";
import { MAX_INPUT_CHARS, type Lang } from "@/lib/demo/types";

import type { useFrontDesk } from "./use-front-desk";

type FD = ReturnType<typeof useFrontDesk>;

const LANG_LABEL: Record<Lang, string> = { en: "English", te: "తెలుగు", hi: "हिन्दी" };
const LANG_CODE: Record<Lang, string> = { en: "en", te: "te", hi: "hi" };

export function CustomerPane({ fd, extraQuestions }: { fd: FD; extraQuestions: string[] }): React.JSX.Element {
  const [text, setText] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const ui = STRINGS[fd.lang].ui;

  useEffect(() => {
    // Scroll the chat box itself. scrollIntoView would also scroll the whole page toward the demo.
    const el = logRef.current;
    if (el && (fd.userCount > 0 || fd.pending)) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [fd.messages, fd.pending, fd.userCount]);

  const chips = fd.suggestions ?? (fd.userCount === 0 && extraQuestions.length ? extraQuestions : defaultChips(fd.business, fd.lang));
  const typing = fd.pending && fd.messages.at(-1)?.role === "user";

  function submit(e: FormEvent): void {
    e.preventDefault();
    const v = text;
    setText("");
    void fd.send(v);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Language" className="inline-flex gap-1 rounded-full border border-border bg-surface p-1">
          {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              lang={LANG_CODE[l]}
              aria-pressed={fd.lang === l}
              onClick={() => fd.changeLang(l)}
              className={clsx("min-h-9 rounded-full px-4 text-sm transition-colors duration-200 ease-out", fd.lang === l ? "bg-signal text-signal-ink" : "text-muted hover:text-text")}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
        <span className="mono flex items-center gap-2 text-muted" title="Simulated clock">
          <span aria-hidden="true">🕘</span>9:42 pm · closed, assistant is on
        </span>
      </div>

      {/* Generic messaging interface. Not modelled on any real app's logo or styling. */}
      <div className="mx-auto flex h-[34rem] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-bg shadow-float">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{fd.business.name}</p>
            <p className="text-xs text-muted">Automated assistant</p>
          </div>
          <Badge>Demo</Badge>
        </div>

        <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation" lang={LANG_CODE[fd.lang]} className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
          {fd.messages.map((m) => (
            <p
              key={m.id}
              className={clsx(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                m.role === "user" ? "self-end rounded-br-md bg-signal text-signal-ink" : "self-start rounded-bl-md bg-surface-2 text-text",
              )}
            >
              {m.text}
            </p>
          ))}
          {typing && (
            <p role="status" className="self-start rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3" aria-label={ui.typing}>
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="live-dot size-1.5 rounded-full bg-muted" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
              </span>
            </p>
          )}
        </div>

        {fd.notice && <p className="border-t border-border bg-surface px-4 py-2 text-xs text-muted">{fd.notice}</p>}

        {!fd.capped && (
          <div className="flex flex-wrap gap-2 border-t border-border bg-surface px-3 py-2">
            {chips.slice(0, 4).map((c) => (
              <Chip key={c} disabled={fd.pending} onClick={() => void fd.send(c)} className="min-h-9 text-xs" lang={LANG_CODE[fd.lang]}>
                {c}
              </Chip>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="flex gap-2 border-t border-border bg-surface p-3">
          <label htmlFor="fd-input" className="sr-only">
            {ui.placeholder}
          </label>
          <input
            id="fd-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_INPUT_CHARS}
            disabled={fd.capped}
            autoComplete="off"
            placeholder={fd.capped ? "Demo limit reached" : ui.placeholder}
            lang={LANG_CODE[fd.lang]}
            className="min-h-11 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-sm text-text placeholder:text-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={fd.pending || fd.capped || !text.trim()}
            className="min-h-11 rounded-full bg-signal px-5 text-sm font-semibold text-signal-ink transition-opacity duration-200 ease-out disabled:opacity-40"
          >
            {ui.send}
          </button>
        </form>
      </div>
      <p className="text-center text-xs text-muted">Don&apos;t type personal details. Nothing here is saved.</p>
    </div>
  );
}
