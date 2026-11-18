"use client";

import { useState, type FormEvent } from "react";

import { usePersona } from "@/components/persona-context";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/feedback";
import { track } from "@/lib/analytics";
import type { Personalisation } from "@/lib/personalise/rules";

import { EnquiryCaught } from "./enquiry-caught";
import { PersonalisedPanel } from "./personalised-panel";

const HEADLINE = ["More", "customers."];
const HEADLINE_EM = ["Less", "manual", "work."];

type Status = "idle" | "loading" | "error";

export function Hero({ whatsappHref }: { whatsappHref: string }): React.JSX.Element {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  // Held in memory only (context). Nothing is stored unless the visitor later submits a form.
  const { persona, setPersona } = usePersona();

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/personalise", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
      const data: unknown = await res.json();
      if (!res.ok) {
        setMessage((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      const result = data as Personalisation;
      setPersona(result);
      setStatus("idle");
      track("hero_personalised", { type: result.type, source: result.source });
    } catch {
      setMessage("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  let word = 0;
  const reveal = (w: string, em = false): React.JSX.Element => (
    <span key={`${w}-${word}`} className={`reveal-word ${em ? "em-serif" : ""}`} style={{ animationDelay: `${40 + word++ * 45}ms` }}>
      {w}&nbsp;
    </span>
  );

  return (
    <section className="mx-auto grid max-w-[var(--max-w)] gap-12 px-[var(--gutter)] pb-24 pt-16 lg:grid-cols-12 lg:items-center lg:pt-24">
      <div className="flex flex-col gap-8 lg:col-span-7">
        <Badge tone="signal" className="self-start">
          AI automation and digital growth studio · Hyderabad
        </Badge>
        <h1 className="text-[length:var(--fs-hero)] leading-[0.95]" aria-label="More customers. Less manual work.">
          <span aria-hidden="true">
            {HEADLINE.map((w) => reveal(w))}
            <br />
            {HEADLINE_EM.map((w) => reveal(w, true))}
          </span>
        </h1>
        <p className="max-w-xl text-muted">
          We build the websites, marketing and AI systems that bring enquiries in, answer them in under a minute and follow up automatically.
        </p>

        <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-3" aria-describedby="persona-help">
          <label htmlFor="persona-input" className="font-display text-lg font-semibold">
            Type your business name and what you do.
          </label>
          <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-2 sm:flex-row">
            <input
              id="persona-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={120}
              required
              minLength={2}
              autoComplete="off"
              placeholder="e.g. Sunrise Dental, dental clinic"
              className="min-h-12 flex-1 rounded-sm bg-transparent px-4 text-text placeholder:text-muted focus-visible:outline-offset-0"
            />
            <Button type="submit" magnetic loading={status === "loading"}>
              {status === "loading" ? "Personalising" : "Show me"}
            </Button>
          </div>
          <p id="persona-help" className="text-sm text-muted">
            We use this only to personalise the demo. Nothing is stored.
          </p>
          {status === "error" && <ErrorState title="Could not personalise" body={message} />}
        </form>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/book-a-demo" variant="secondary">
            Book a personalised demo
          </ButtonLink>
          <ButtonLink href="/growth-scan" variant="secondary">
            Get a free growth scan
          </ButtonLink>
          <ButtonLink
            href={whatsappHref}
            variant="ghost"
            onClick={() => track("whatsapp_clicked", { where: "hero" })}
          >
            Chat on WhatsApp
          </ButtonLink>
        </div>
      </div>

      <div className="lg:col-span-5" aria-live="polite">
        {persona ? <PersonalisedPanel persona={persona} onReset={() => setPersona(null)} /> : <EnquiryCaught />}
      </div>
    </section>
  );
}
