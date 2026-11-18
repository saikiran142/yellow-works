"use client";

import { useState, type ReactNode } from "react";

import { BottomBar } from "@/components/site/bottom-bar";
import { Header } from "@/components/site/header";
import { Logo } from "@/components/site/logo";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Bento, Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { CountUp, MonoStat } from "@/components/ui/counter";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton, Toast, Tooltip } from "@/components/ui/feedback";
import { Stepper } from "@/components/ui/stepper";
import { Tabs } from "@/components/ui/tabs";
import { TimelineNode } from "@/components/ui/timeline-node";

const swatches = [
  ["bg", "bg-bg"],
  ["surface", "bg-surface"],
  ["surface-2", "bg-surface-2"],
  ["border", "bg-border"],
  ["text", "bg-text"],
  ["muted", "bg-muted"],
  ["signal", "bg-signal"],
  ["ice", "bg-ice"],
  ["ember", "bg-ember"],
  ["ok", "bg-ok"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }): React.JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[length:var(--fs-h3)]">{title}</h2>
      {children}
    </section>
  );
}

/** Everything below is rendered once per theme so both can be compared at a glance. */
function Specimen(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [chip, setChip] = useState("fees");

  return (
    <div className="flex flex-col gap-12">
      <Section title="Colour">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`${cls} h-14 rounded-sm border border-border`} />
              <span className="mono text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <p className="text-[length:var(--fs-hero)] font-semibold leading-none tracking-tight">
          Less <span className="em-serif">manual work</span>
        </p>
        <p className="text-[length:var(--fs-h2)] font-semibold">Display heading, Geist</p>
        <p>Body copy in Inter at 16–18px with a 1.6 line-height. Short sentences. Plain words.</p>
        <p className="mono text-muted">09:42 pm · replied in 00:06 s · Geist Mono</p>
        <p lang="te">తెలుగు: మీ వ్యాపారానికి మరిన్ని కస్టమర్లు.</p>
        <p lang="hi">हिन्दी: आपके व्यवसाय के लिए अधिक ग्राहक।</p>
      </Section>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-8">
          <Logo mode="wide" />
          <Logo mode="mark" />
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button magnetic>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
            {loading ? "Sending" : "Click for loading"}
          </Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="#top" variant="secondary">Link button</ButtonLink>
        </div>
      </Section>

      <Section title="Badges, chips, tooltip, counters">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Demo</Badge>
          <Badge tone="signal">Live</Badge>
          <Badge tone="ice">Scored 82</Badge>
          <Badge tone="ok">Booked</Badge>
          <Badge tone="ember">Needs staff</Badge>
          <Tooltip label="Replies come from business knowledge only">
            <button type="button" className="rounded-full border border-border px-3 py-1 text-sm">Hover or focus me</button>
          </Tooltip>
        </div>
        <div className="flex flex-wrap gap-2">
          {[["fees", "What are your fees?"], ["sat", "Book Saturday"], ["hours", "Opening hours"]].map(([id, label]) => (
            <Chip key={id} selected={chip === id} onClick={() => setChip(id ?? "")}>{label}</Chip>
          ))}
          <Chip disabled>Disabled</Chip>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <MonoStat label="Replied in" value="00:06 s" live />
          <span className="text-muted">Count-up: <CountUp to={48} suffix=" hrs" className="text-signal" /></span>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business name" hint="As customers know it.">
            {(a) => <Input id={a.id} aria-describedby={a.describedBy} placeholder="Sunrise Dental" />}
          </Field>
          <Field label="WhatsApp number" error="Enter a 10-digit mobile number.">
            {(a) => <Input id={a.id} aria-describedby={a.describedBy} invalid={a.invalid} defaultValue="98765" />}
          </Field>
          <Field label="Industry">
            {(a) => (
              <Select id={a.id}>
                <option>Clinic</option>
                <option>Real estate</option>
              </Select>
            )}
          </Field>
          <Field label="Disabled">{(a) => <Input id={a.id} disabled placeholder="Not available" />}</Field>
          <div className="md:col-span-2">
            <Field label="Biggest headache">{(a) => <Textarea id={a.id} placeholder="Missed enquiries after 7 pm" />}</Field>
          </div>
        </div>
      </Section>

      <Section title="Stepper and tabs">
        <Stepper steps={["Business", "Industry", "Channel", "Headache", "WhatsApp", "Time"]} current={step} />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
          <Button onClick={() => setStep((s) => Math.min(5, s + 1))}>Next</Button>
        </div>
        <Tabs
          label="Demo view"
          items={[
            { id: "c", label: "Your customer", panel: <p className="text-muted">Customer messaging view.</p> },
            { id: "d", label: "Your dashboard", panel: <p className="text-muted">Owner dashboard view.</p> },
          ]}
        />
      </Section>

      <Section title="Cards and bento">
        <Bento>
          <Card className="md:col-span-6 lg:col-span-7">
            <h3 className="text-[length:var(--fs-h3)]">Spotlight card</h3>
            <p className="mt-2 text-muted">Move the cursor over this card. Border warms to signal on hover.</p>
          </Card>
          <Card className="md:col-span-3 lg:col-span-5"><p className="text-muted">Second card, stacks in reading order on mobile.</p></Card>
        </Bento>
      </Section>

      <Section title="Workflow nodes">
        <div className="grid gap-3 sm:grid-cols-2">
          <TimelineNode title="Captured" time="0:00" state="done" />
          <TimelineNode title="Enriched and scored" time="0:02" state="running" />
          <TimelineNode title="Instant reply (preview)" state="idle" />
          <TimelineNode title="Staff alerted" time="0:07" state="error">Hand-over needed</TimelineNode>
        </div>
      </Section>

      <Section title="Loading, empty, error, toast">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-2"><Skeleton className="h-6 w-2/3" /><Skeleton /><Skeleton className="w-5/6" /></div>
          <EmptyState title="No leads yet" body="Send a message to see a lead appear here." />
          <ErrorState title="Demo mode" body="Live replies are busy. Showing a scripted example." action={<Button variant="secondary">Try again</Button>} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Toast tone="ok">Booking confirmed</Toast>
          <Toast tone="ember">Needs staff</Toast>
          <Toast tone="info">Nothing is sent to anyone</Toast>
        </div>
      </Section>
    </div>
  );
}

export default function StyleguidePage(): React.JSX.Element {
  return (
    <>
      <Header />
      <main id="top" className="mx-auto flex max-w-[var(--max-w)] flex-col gap-16 px-[var(--gutter)] pb-32 pt-16">
        <header className="flex flex-col gap-3">
          <Badge tone="signal" className="self-start">Internal</Badge>
          <h1 className="text-[length:var(--fs-h1)]">Styleguide</h1>
          <p className="max-w-xl text-muted">
            Every component and state, rendered in both themes side by side. Use the header toggle to flip the whole page.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {(["dark", "light"] as const).map((t) => (
            <div key={t} data-theme={t} className="rounded-lg border border-border bg-bg p-6 text-text md:p-8">
              <p className="mono mb-8 uppercase tracking-widest text-muted">{t} theme</p>
              <Specimen />
            </div>
          ))}
        </div>
      </main>
      <BottomBar whatsappHref="https://wa.me/[number]" />
    </>
  );
}
