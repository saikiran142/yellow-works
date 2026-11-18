"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice";
import { Field, Input } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { track } from "@/lib/analytics";
import { newKey, postLead } from "@/lib/attribution";
import { digitsToInt, formatInr } from "@/lib/format";
import { HEADACHE_LABEL, HEADACHES, type Headache } from "@/lib/leads/options";
import { scanLeadSchema } from "@/lib/leads/schema";
import { DEFAULT_LOSS_PCT, SOURCES, SPEEDS, TOOLS, recommendServices, scoreLabel, scoreScan, valueAtRisk, type ScanAnswers, type Speed } from "@/lib/scan/score";
import { GROUP_LABEL } from "@/content/services";

const SOURCE_LABEL: Record<(typeof SOURCES)[number], string> = { google: "Google search or maps", instagram: "Instagram", facebook: "Facebook", whatsapp: "WhatsApp", "walk-ins": "Walk-ins", referrals: "Word of mouth", "paid-ads": "Paid ads", website: "Our website" };
const SPEED_LABEL: Record<Speed, string> = { "under-5-min": "Within 5 minutes", "within-1-hour": "Within an hour", "same-day": "The same day", "next-day-or-later": "Next day or later" };
const TOOL_LABEL: Record<(typeof TOOLS)[number], string> = { none: "Nothing yet", spreadsheet: "Spreadsheet or notebook", crm: "A CRM", "whatsapp-business": "WhatsApp Business app", "booking-software": "Booking software", chatbot: "A chatbot" };
const opts = <T extends string>(values: readonly T[], labels: Record<T, string>) => values.map((v) => ({ value: v, label: labels[v] }));

const STEPS = ["Sources", "Reply speed", "Tools", "Headache", "Volume", "Value"];

interface Draft {
  sources: (typeof SOURCES)[number][];
  speed?: Speed;
  tools: (typeof TOOLS)[number][];
  headache?: Headache;
  monthlyEnquiries: string;
  avgValue: string;
}

export function GrowthScan({ whatsappNumber }: { whatsappNumber: string }): React.JSX.Element {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>({ sources: [], tools: [], monthlyEnquiries: "", avgValue: "" });
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<ScanAnswers | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step, answers]);

  function next(e: FormEvent): void {
    e.preventDefault();
    const missing =
      step === 0 ? (d.sources.length ? "" : "Pick at least one.") :
      step === 1 ? (d.speed ? "" : "Choose one.") :
      step === 2 ? (d.tools.length ? "" : "Pick at least one, or choose Nothing yet.") :
      step === 3 ? (d.headache ? "" : "Choose one.") :
      step === 4 ? (d.monthlyEnquiries.trim() ? "" : "Enter a number. A rough guess is fine.") :
      d.avgValue.trim() ? "" : "Enter an amount in rupees. A rough guess is fine.";
    if (missing) return setError(missing);
    setError("");
    if (step < STEPS.length - 1) return setStep(step + 1);
    const a: ScanAnswers = {
      sources: d.sources,
      speed: d.speed as Speed,
      tools: d.tools,
      headache: d.headache as Headache,
      monthlyEnquiries: digitsToInt(d.monthlyEnquiries, 5000),
      avgValue: digitsToInt(d.avgValue, 1_000_000),
    };
    setAnswers(a);
    track("scan_completed", { score: scoreScan(a).total });
  }

  if (answers) return <Result answers={answers} whatsappNumber={whatsappNumber} onRestart={() => { setAnswers(null); setStep(0); }} heading={heading} />;

  return (
    <form onSubmit={next} noValidate className="card flex flex-col gap-8 p-6 md:p-8">
      <Stepper steps={STEPS} current={step} />
      <h2 ref={heading} tabIndex={-1} className="sr-only">{STEPS[step]}</h2>

      {step === 0 && <ChoiceGroup name="sources" mode="many" legend="Where do your enquiries come from?" hint="Pick all that apply." options={opts(SOURCES, SOURCE_LABEL)} value={d.sources} onChange={(x) => setD({ ...d, sources: x as Draft["sources"] })} error={error} />}
      {step === 1 && <ChoiceGroup name="speed" mode="one" legend="How fast do you usually reply to a new enquiry?" options={opts(SPEEDS, SPEED_LABEL)} value={d.speed} onChange={(x) => setD({ ...d, speed: x as Speed })} error={error} />}
      {step === 2 && (
        <ChoiceGroup
          name="tools"
          mode="many"
          legend="Which tools do you use to handle enquiries?"
          hint="Pick all that apply."
          options={opts(TOOLS, TOOL_LABEL)}
          value={d.tools}
          onChange={(x) => {
            const picked = x as Draft["tools"];
            const added = picked.find((t) => !d.tools.includes(t));
            setD({ ...d, tools: added === "none" ? ["none"] : picked.filter((t) => t !== "none") });
          }}
          error={error}
        />
      )}
      {step === 3 && <ChoiceGroup name="headache" mode="one" legend="What is your biggest headache?" options={opts(HEADACHES, HEADACHE_LABEL)} value={d.headache} onChange={(x) => setD({ ...d, headache: x as Headache })} error={error} />}
      {step === 4 && (
        <Field label="Roughly how many enquiries do you get in a month?" hint="Calls, messages and forms together. A rough guess is fine." error={error}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} inputMode="numeric" value={d.monthlyEnquiries} onChange={(e) => setD({ ...d, monthlyEnquiries: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="e.g. 120" />}
        </Field>
      )}
      {step === 5 && (
        <Field label="What is a new customer worth to you, on average?" hint="In rupees, per customer (the first visit or the first year, whichever you use)." error={error}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} inputMode="numeric" value={d.avgValue} onChange={(e) => setD({ ...d, avgValue: e.target.value.replace(/\D/g, "").slice(0, 7) })} placeholder="e.g. 2500" />}
        </Field>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => { setError(""); setStep(Math.max(0, step - 1)); }} disabled={step === 0}>Back</Button>
        <Button type="submit" magnetic>{step === STEPS.length - 1 ? "See my result" : "Next"}</Button>
      </div>
    </form>
  );
}

function Result({ answers, whatsappNumber, onRestart, heading }: { answers: ScanAnswers; whatsappNumber: string; onRestart: () => void; heading: React.RefObject<HTMLHeadingElement | null> }): React.JSX.Element {
  const score = useMemo(() => scoreScan(answers), [answers]);
  const services = useMemo(() => recommendServices(answers), [answers]);
  const [pct, setPct] = useState(String(DEFAULT_LOSS_PCT[answers.speed]));
  const risk = valueAtRisk(answers, digitsToInt(pct, 100));

  return (
    <div className="flex flex-col gap-8">
      <div className="card flex flex-col gap-6 p-6 md:p-8">
        <h2 ref={heading} tabIndex={-1} className="text-[length:var(--fs-h2)] outline-none">Your Growth Scan</h2>
        <div className="flex flex-wrap items-end gap-4">
          <p className="mono text-[length:var(--fs-hero)] font-semibold leading-none text-signal" aria-label={`Score ${score.total} out of 100`}>{score.total}<span className="text-2xl text-muted">/100</span></p>
          <Badge tone={score.total >= 75 ? "ok" : score.total >= 50 ? "ice" : "ember"}>{scoreLabel(score.total)}</Badge>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {score.parts.map((p) => (
            <li key={p.label} className="text-sm">
              <div className="mb-1 flex justify-between"><span>{p.label}</span><span className="mono text-muted">{p.points}/{p.max}</span></div>
              <div className="h-1.5 rounded-full bg-surface-2" role="presentation"><div className={clsx("h-full rounded-full bg-signal")} style={{ width: `${(p.points / p.max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card flex flex-col gap-4 p-6 md:p-8">
        <h3 className="text-[length:var(--fs-h3)]">Enquiry value at risk</h3>
        {answers.monthlyEnquiries === 0 || answers.avgValue === 0 ? (
          <p className="text-muted">Add your monthly enquiries and average customer value to see this. <button type="button" className="text-ice underline" onClick={onRestart}>Start again</button></p>
        ) : (
          <>
            <p className="mono text-3xl font-semibold" aria-live="polite">{formatInr(risk.monthly)} <span className="text-base font-normal text-muted">a month</span></p>
            <p className="mono text-sm text-muted">{risk.formula}</p>
            <div className="max-w-xs">
              <Field label="Share of enquiries that go cold (%)" hint="This is our planning assumption for your reply speed, not a measured figure. Change it to match your own experience.">
                {(a) => <Input id={a.id} aria-describedby={a.describedBy} inputMode="numeric" value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, "").slice(0, 3))} />}
              </Field>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-[length:var(--fs-h3)]">The three services that fit best</h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {services.map((s) => (
            <li key={s.id} className="card p-5">
              <p className="mono mb-2 text-muted">{GROUP_LABEL[s.group]}</p>
              <p className="font-display text-lg font-semibold">{s.name}</p>
              <p className="mt-1 text-sm text-muted">{s.summary}</p>
              <a className="mt-3 inline-block text-sm text-ice underline" href={`/services#${s.id}`}>Learn more</a>
            </li>
          ))}
        </ul>
      </div>

      <SendResult answers={answers} pct={digitsToInt(pct, 100)} whatsappNumber={whatsappNumber} />
      <div><Button variant="ghost" onClick={onRestart}>Start again</Button></div>
    </div>
  );
}

function SendResult({ answers, pct, whatsappNumber }: { answers: ScanAnswers; pct: number; whatsappNumber: string }): React.JSX.Element {
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState<"whatsapp" | "email">("whatsapp");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const key = useRef(newKey());
  const mounted = useRef(Date.now());

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (busy) return;
    const hp = (e.currentTarget as HTMLFormElement).elements.namedItem("company_website") as HTMLInputElement | null;
    const payload = { kind: "scan", idempotencyKey: key.current, elapsedMs: Date.now() - mounted.current, company_website: hp?.value ?? "", name, delivery, whatsapp: delivery === "whatsapp" ? contact : "", email: delivery === "email" ? contact : "", consent, answers, assumedLossPct: pct };
    const check = scanLeadSchema.safeParse(payload);
    if (!check.success) {
      const f: Record<string, string> = {};
      for (const i of check.error.issues) f[i.path[0] === "email" || i.path[0] === "whatsapp" ? "contact" : String(i.path[0])] ??= i.message;
      return setErrors(f);
    }
    setErrors({});
    setBusy(true);
    setFormError("");
    const res = await postLead(payload);
    setBusy(false);
    if (res.ok) return setSent(true);
    setFormError(res.error ?? "Something went wrong.");
  }

  if (sent) {
    return (
      <div className="card flex flex-col gap-4 p-6 md:p-8" role="status">
        <h3 className="text-[length:var(--fs-h3)]">Got it, {name.split(" ")[0]}.</h3>
        <p className="text-muted">We will send your full result by {delivery === "whatsapp" ? "WhatsApp" : "email"} shortly. Want to see it working for your business?</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/book-a-demo">Book a personalised demo</ButtonLink>
          <ButtonLink variant="secondary" href={`https://wa.me/${whatsappNumber}`} onClick={() => track("whatsapp_clicked", { where: "scan_sent" })}>Chat on WhatsApp</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card flex flex-col gap-5 p-6 md:p-8">
      <h3 className="text-[length:var(--fs-h3)]">Get the full result</h3>
      <p className="text-muted">We will send your score, the numbers behind it and a short plan. Only your answers above are shared, nothing else.</p>
      <input name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <Field label="Your name" error={errors.name}>{(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />}</Field>
      <ChoiceGroup name="delivery" mode="one" legend="Send it by" options={[{ value: "whatsapp", label: "WhatsApp" }, { value: "email", label: "Email" }]} value={delivery} onChange={(x) => { setDelivery(x as "whatsapp" | "email"); setContact(""); }} />
      <Field label={delivery === "whatsapp" ? "WhatsApp number" : "Email address"} error={errors.contact}>
        {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} type={delivery === "whatsapp" ? "tel" : "email"} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete={delivery === "whatsapp" ? "tel" : "email"} maxLength={120} />}
      </Field>
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-5 accent-[var(--c-signal)]" />
          <span>I agree that The Yellow Works may send me this result and contact me about it. See the <a className="text-ice underline" href="/privacy">privacy policy</a>.</span>
        </label>
        {errors.consent && <p role="alert" className="flex items-center gap-1.5 text-sm text-ember"><span aria-hidden="true">⚑</span>{errors.consent}</p>}
      </div>
      {formError && <p role="alert" className="flex items-center gap-1.5 text-sm text-ember"><span aria-hidden="true">⚑</span>{formError}</p>}
      <div><Button type="submit" loading={busy} magnetic>Send me the result</Button></div>
    </form>
  );
}
