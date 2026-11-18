"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { track } from "@/lib/analytics";
import { newKey, postLead } from "@/lib/attribution";
import { CHANNEL_LABEL, CHANNELS, HEADACHE_LABEL, HEADACHES, INDUSTRIES, INDUSTRY_LABEL, TIME_LABEL, TIMES, type Channel, type Headache, type PreferredTime } from "@/lib/leads/options";
import { demoLeadSchema } from "@/lib/leads/schema";
import type { BusinessType } from "@/lib/demo/types";

const STEPS = ["Business", "Industry", "Channel", "Headache", "WhatsApp", "Time"];
/** Which fields belong to which step, for validation and for jumping to a server-reported error. */
const STEP_FIELDS: (keyof typeof demoLeadSchema.shape)[][] = [["name", "business"], ["industry"], ["channel"], ["headache"], ["whatsapp"], ["preferredTime", "consent"]];

interface Values {
  name: string;
  business: string;
  industry?: BusinessType;
  channel?: Channel;
  headache?: Headache;
  headacheNote: string;
  whatsapp: string;
  preferredTime?: PreferredTime;
  consent: boolean;
}

const opts = <T extends string>(values: readonly T[], labels: Record<T, string>) => values.map((v) => ({ value: v, label: labels[v] }));

export function BookDemoForm({ whatsappNumber, calendarUrl }: { whatsappNumber: string; calendarUrl?: string }): React.JSX.Element {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>({ name: "", business: "", headacheNote: "", whatsapp: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const key = useRef(newKey());
  const mounted = useRef(Date.now());
  const heading = useRef<HTMLHeadingElement>(null);

  const firstRender = useRef(true);
  useEffect(() => {
    // Move focus to the step heading when the step changes, but never steal focus on page load.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step, done]);

  const set = <K extends keyof Values>(k: K, val: Values[K]): void => {
    setV((p) => ({ ...p, [k]: val }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validate(fields: string[]): boolean {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const schema = demoLeadSchema.shape[f as keyof typeof demoLeadSchema.shape];
      const raw = (v as unknown as Record<string, unknown>)[f];
      // Pass the raw value through (including ""), so the schema's own plain-language message is shown.
      const r = schema.safeParse(raw);
      if (!r.success) next[f] = r.error.issues[0]?.message ?? "Please check this.";
    }
    setErrors((e) => ({ ...e, ...next }));
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    if (!validate(STEP_FIELDS[step] as string[])) return;
    if (step < STEPS.length - 1) return setStep(step + 1);

    setSubmitting(true);
    setFormError("");
    const honeypot = (e.currentTarget as HTMLFormElement).elements.namedItem("company_website") as HTMLInputElement | null;
    const res = await postLead({ kind: "demo", idempotencyKey: key.current, elapsedMs: Date.now() - mounted.current, company_website: honeypot?.value ?? "", ...v, headacheNote: v.headacheNote || undefined });
    setSubmitting(false);
    if (res.ok) {
      track("demo_booked", { industry: v.industry ?? "" });
      return setDone(true);
    }
    if (res.fields) {
      setErrors(res.fields);
      const first = STEP_FIELDS.findIndex((fs) => fs.some((f) => res.fields?.[f as string]));
      if (first >= 0) setStep(first);
    }
    setFormError(res.error ?? "Something went wrong.");
  }

  if (done) {
    const text = `Hi, I'm ${v.name} from ${v.business}. I just asked for a personalised demo (${v.preferredTime ? TIME_LABEL[v.preferredTime] : "any time"}).`;
    return (
      <div className="card flex flex-col gap-5 p-8" role="status">
        <h2 ref={heading} tabIndex={-1} className="text-[length:var(--fs-h2)] outline-none">
          Thanks, <span className="em-serif">{v.name.split(" ")[0]}.</span>
        </h2>
        <p className="text-muted">We have your request. We will message you on WhatsApp to confirm a time, usually within one working day. For a faster reply, message us now.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`} onClick={() => track("whatsapp_clicked", { where: "booking_confirmation" })}>
            Continue on WhatsApp
          </ButtonLink>
          {calendarUrl && (
            <ButtonLink href={calendarUrl} variant="secondary">
              Pick a time on the calendar
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card flex flex-col gap-8 p-6 md:p-8">
      <Stepper steps={STEPS} current={step} />
      <h2 ref={heading} tabIndex={-1} className="sr-only">
        {STEPS[step]}
      </h2>

      {/* Honeypot: hidden from people and assistive tech. */}
      <input name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {step === 0 && (
        <div className="grid gap-5">
          <Field label="Your name" error={errors.name}>
            {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={80} />}
          </Field>
          <Field label="Business name" error={errors.business}>
            {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} value={v.business} onChange={(e) => set("business", e.target.value)} autoComplete="organization" maxLength={80} />}
          </Field>
        </div>
      )}
      {step === 1 && <ChoiceGroup name="industry" mode="one" legend="What kind of business is it?" options={opts(INDUSTRIES, INDUSTRY_LABEL)} value={v.industry} onChange={(x) => set("industry", x as BusinessType)} error={errors.industry} />}
      {step === 2 && <ChoiceGroup name="channel" mode="one" legend="Where do most enquiries come from today?" options={opts(CHANNELS, CHANNEL_LABEL)} value={v.channel} onChange={(x) => set("channel", x as Channel)} error={errors.channel} />}
      {step === 3 && (
        <div className="grid gap-5">
          <ChoiceGroup name="headache" mode="one" legend="What is your biggest headache?" options={opts(HEADACHES, HEADACHE_LABEL)} value={v.headache} onChange={(x) => set("headache", x as Headache)} error={errors.headache} />
          <Field label="Anything else we should know? (optional)" hint="Please don't include personal details of your customers.">
            {(a) => <Textarea id={a.id} aria-describedby={a.describedBy} value={v.headacheNote} onChange={(e) => set("headacheNote", e.target.value)} maxLength={300} />}
          </Field>
        </div>
      )}
      {step === 4 && (
        <Field label="Your WhatsApp number" hint="We will only use this to confirm your demo." error={errors.whatsapp}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" maxLength={20} />}
        </Field>
      )}
      {step === 5 && (
        <div className="grid gap-5">
          <ChoiceGroup name="time" mode="one" legend="When should we call or message?" options={opts(TIMES, TIME_LABEL)} value={v.preferredTime} onChange={(x) => set("preferredTime", x as PreferredTime)} error={errors.preferredTime} />
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-describedby={errors.consent ? "consent-err" : undefined} className="mt-1 size-5 accent-[var(--c-signal)]" />
              <span>I agree that The Yellow Works may contact me about this demo. See the <a className="text-ice underline" href="/privacy">privacy policy</a>.</span>
            </label>
            {errors.consent && (
              <p id="consent-err" role="alert" className="flex items-center gap-1.5 text-sm text-ember">
                <span aria-hidden="true">⚑</span>
                {errors.consent}
              </p>
            )}
          </div>
        </div>
      )}

      {formError && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-ember">
          <span aria-hidden="true">⚑</span>
          {formError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || submitting}>
          Back
        </Button>
        <Button type="submit" loading={submitting} magnetic>
          {step === STEPS.length - 1 ? "Book my demo" : "Next"}
        </Button>
      </div>
    </form>
  );
}
