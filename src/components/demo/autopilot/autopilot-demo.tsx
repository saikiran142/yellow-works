"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { usePersona } from "@/components/persona-context";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { MonoStat } from "@/components/ui/counter";
import { ErrorState } from "@/components/ui/feedback";
import { Field, Select, Textarea } from "@/components/ui/field";
import { TimelineNode } from "@/components/ui/timeline-node";
import { DEMO_BUSINESSES } from "@/content/demo-businesses";
import { track } from "@/lib/analytics";
import { AD_LEADS, MAX_ENQUIRY_CHARS, buildAutopilot, type AutopilotResult, type RunStep } from "@/lib/autopilot/engine";
import type { BusinessType } from "@/lib/demo/types";

import { Previews } from "./previews";

type Mode = "auto" | "manual";
type Phase = "idle" | "loading" | "running" | "done";

const newSession = (): string => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `s-${Math.random().toString(36).slice(2)}-${Date.now()}`);

export function AutopilotDemo(): React.JSX.Element {
  const { persona } = usePersona();
  const [type, setType] = useState<BusinessType>("clinic");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AutopilotResult | null>(null);
  const [source, setSource] = useState<"form" | "ad">("form");
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const session = useRef(newSession());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (persona) setType(persona.type);
  }, [persona]);

  const nameOverride = persona && persona.type === type ? persona.businessName : undefined;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const play = useCallback(
    (res: AutopilotResult, m: Mode) => {
      clearTimers();
      const run = m === "auto" ? res.auto : res.manual;
      setDoneIds([]);
      setElapsed(0);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDoneIds(run.steps.map((s) => s.id));
        setElapsed(run.firstReplyMs ?? 0);
        setPhase("done");
        return;
      }
      setPhase("running");
      const t0 = performance.now();
      if (m === "auto") {
        tick.current = setInterval(() => setElapsed(Math.min(performance.now() - t0, run.firstReplyMs ?? Infinity)), 100);
      }
      run.steps.forEach((s, i) => {
        timers.current.push(
          setTimeout(() => {
            setDoneIds((d) => [...d, s.id]);
            if (i === run.steps.length - 1) {
              clearTimers();
              if (m === "auto") setElapsed(run.firstReplyMs ?? 0);
              setPhase("done");
              track("demo_completed", { demo: m === "auto" ? "autopilot" : "manual" });
            }
          }, s.playAt + 300),
        );
      });
    },
    [clearTimers],
  );

  async function start(enquiry: string, src: "form" | "ad"): Promise<void> {
    const clean = enquiry.trim().slice(0, MAX_ENQUIRY_CHARS);
    if (clean.length < 2) {
      setError("Type a sample enquiry first, or simulate an ad lead.");
      return;
    }
    setError("");
    setNotice("");
    setSource(src);
    setPhase("loading");
    setMode("auto");
    clearTimers();
    setDoneIds([]);
    if (!started.current) {
      started.current = true;
      track("demo_started", { demo: "autopilot" });
    }
    const payload = { text: clean, businessType: type, businessName: nameOverride, source: src, sessionId: session.current };
    let res: AutopilotResult;
    try {
      const r = await fetch("/api/demo/autopilot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(String(r.status));
      res = (await r.json()) as AutopilotResult;
    } catch {
      // Scripted fallback in the browser so the demo never appears broken.
      setNotice("Live service is busy, so this run is generated in your browser.");
      res = buildAutopilot({ text: clean, businessType: type, businessName: nameOverride, source: src });
    }
    setResult(res);
    play(res, "auto");
  }

  function onSubmit(e: FormEvent): void {
    e.preventDefault();
    void start(text, "form");
  }

  function simulateAd(): void {
    const sample = AD_LEADS[type];
    setText(sample);
    void start(sample, "ad");
  }

  function switchMode(m: Mode): void {
    if (!result || m === mode || phase === "loading") return;
    setMode(m);
    play(result, m);
  }

  const run = result ? (mode === "auto" ? result.auto : result.manual) : null;
  const busy = phase === "loading" || phase === "running";
  const counter = !result
    ? "--"
    : mode === "manual"
      ? doneIds.includes("replied")
        ? `${run?.firstReplyLabel}`
        : "waiting…"
      : `${(elapsed / 1000).toFixed(1)} s`;

  const stateOf = (s: RunStep, i: number): "idle" | "running" | "done" | "error" => {
    if (doneIds.includes(s.id)) return s.status === "missed" ? "error" : "done";
    const prevDone = i === 0 || doneIds.includes((run?.steps[i - 1] as RunStep).id);
    return phase === "running" && prevDone ? "running" : "idle";
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Field label="Business type">
            {(a) => (
              <Select id={a.id} value={type} onChange={(e) => setType(e.target.value as BusinessType)} disabled={busy}>
                {DEMO_BUSINESSES.map((b) => (
                  <option key={b.type} value={b.type}>
                    {b.industryLabel}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <div className="lg:col-span-6">
          <Field label="Sample enquiry" hint="Write what a customer might send. Don't type real names or numbers." error={error}>
            {(a) => (
              <Textarea id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_ENQUIRY_CHARS} disabled={busy} rows={2} placeholder="e.g. Hi, how much is a facial? Is a slot free tomorrow?" />
            )}
          </Field>
        </div>
        <div className="flex flex-wrap items-end gap-3 lg:col-span-3">
          <Button type="submit" loading={phase === "loading"} disabled={busy} magnetic>
            Send enquiry
          </Button>
          <Button type="button" variant="secondary" onClick={simulateAd} disabled={busy}>
            Simulate an ad lead
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Playback mode" className="inline-flex gap-1 rounded-full border border-border bg-surface p-1">
          <button type="button" aria-pressed={mode === "auto"} onClick={() => switchMode("auto")} disabled={!result || busy} className={clsx("min-h-10 rounded-full px-5 text-sm font-medium transition-colors duration-200 ease-out disabled:opacity-60", mode === "auto" ? "bg-signal text-signal-ink" : "text-muted hover:text-text")}>
            With autopilot
          </button>
          <button type="button" aria-pressed={mode === "manual"} onClick={() => switchMode("manual")} disabled={!result || busy} className={clsx("min-h-10 rounded-full px-5 text-sm font-medium transition-colors duration-200 ease-out disabled:opacity-60", mode === "manual" ? "bg-signal text-signal-ink" : "text-muted hover:text-text")}>
            Without autopilot
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {mode === "manual" && <Badge tone="ember">Illustration</Badge>}
          <MonoStat label="Time to first reply" value={counter} live={mode === "auto" && phase === "running"} />
        </div>
      </div>

      {notice && <p className="text-sm text-muted">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-label="Workflow" className="lg:col-span-8">
          {!run && phase !== "loading" && (
            <div className="rounded-card border border-dashed border-border p-10 text-center">
              <p className="font-display text-lg font-semibold">Send an enquiry to watch the workflow run</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">Each step lights up with its own timestamp. Nothing is sent to anyone.</p>
            </div>
          )}
          {phase === "loading" && (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-card" aria-hidden="true" />
              ))}
            </div>
          )}
          {run && phase !== "loading" && (
            <>
              <p className="mb-3 text-sm text-muted" aria-live="polite">
                {mode === "auto" ? "Every step runs on its own, in seconds." : "The same enquiry, handled by hand. Typical delays vary; this is an illustration."}
              </p>
              <ol className="relative grid gap-4 rounded-card border border-border bg-surface/40 p-4 md:grid-cols-2 xl:grid-cols-3 [background-image:radial-gradient(var(--c-border)_1px,transparent_1px)] [background-size:20px_20px]">
                {run.steps.map((s, i) => {
                  const st = stateOf(s, i);
                  return (
                    <li key={s.id} className="relative">
                      {/* connector to the next node (vertical on mobile) */}
                      {i < run.steps.length - 1 && <span aria-hidden="true" className={clsx("absolute left-1/2 top-full h-4 w-0.5 -translate-x-1/2 transition-colors duration-300 md:hidden", doneIds.includes(s.id) ? "bg-signal" : "bg-border")} />}
                      <TimelineNode title={`${i + 1}. ${s.title}`} time={st === "idle" ? undefined : s.at} state={st} stateLabel={st === "error" ? (mode === "manual" ? "Missed" : undefined) : undefined}>
                        {st === "running" ? <span className="skeleton block h-4 w-3/4" aria-hidden="true" /> : st === "idle" ? null : s.detail}
                      </TimelineNode>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
          {result && (
            <details className="mt-4 rounded-card border border-border bg-surface p-4 text-sm">
              <summary className="cursor-pointer font-medium">Why this score? {result.score}/100 · {result.tier}</summary>
              <ul className="mt-3 flex flex-col gap-1 text-muted">
                {result.factors.map((f) => (
                  <li key={f} className="mono">{f}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">Detected: {result.enrichment.intent}{result.enrichment.service ? ` · ${result.enrichment.service}` : ""} · {result.enrichment.language} · {source === "ad" ? "sample ad lead" : "your sample enquiry"}.</p>
            </details>
          )}
        </section>

        <aside aria-label="Message previews" className="lg:col-span-4">
          <Previews result={result} mode={mode} doneIds={doneIds} phase={phase} />
        </aside>
      </div>

      {phase === "done" && (
        <div className="card flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <p className="max-w-xl font-display text-xl font-semibold">Want this running with your own business details? We build it in 48 hours, free.</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/book-a-demo" magnetic>Book a demo</ButtonLink>
            {mode === "auto" ? <Button variant="secondary" onClick={() => switchMode("manual")}>See it without autopilot</Button> : <Button variant="secondary" onClick={() => switchMode("auto")}>Replay with autopilot</Button>}
          </div>
        </div>
      )}
      {error && phase === "idle" && !result && <ErrorState title="Could not start" body={error} />}
      <p className="text-center text-xs text-muted">Nothing is sent to anyone. Sample enquiries are not saved.</p>
    </div>
  );
}
