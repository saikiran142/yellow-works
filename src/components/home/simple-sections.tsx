import { JsonLd, faqLd } from "@/components/seo/json-ld";
import { Container, SectionHead } from "@/components/site/shell";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FAQS } from "@/content/faqs";
import { PACKAGES, PRICING_NOTE } from "@/content/packages";
import { PROCESS, SITE, TRUST, show, whatsappHref } from "@/content/site";

import { PackageCard } from "./package-card";

export function ScanEntry(): React.JSX.Element {
  return (
    <section aria-labelledby="scan-title" className="py-12">
      <Container>
        <Card className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="mono mb-3 text-muted">Free · two minutes</p>
            <h2 id="scan-title" className="text-[length:var(--fs-h2)]">
              See what slow replies <span className="em-serif">may be costing you.</span>
            </h2>
            <p className="mt-3 text-muted">Six questions. A score, an estimate using your own numbers with the formula shown, and the three services that fit best.</p>
          </div>
          <ButtonLink href="/growth-scan" magnetic>Start the free scan</ButtonLink>
        </Card>
      </Container>
    </section>
  );
}

export function HowWeWork(): React.JSX.Element {
  return (
    <section aria-labelledby="how-title" className="py-24">
      <Container>
        <SectionHead id="how-title" eyebrow="How we work" title="A clear process," em="no surprises." />
        <ol className="grid gap-4 md:grid-cols-5">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="card flex flex-col gap-2 p-5">
              <span className="mono text-signal" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-lg font-semibold leading-snug">{s.title}</h3>
              <p className="text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function PricingPreview(): React.JSX.Element {
  return (
    <section aria-labelledby="pricing-title" className="py-24">
      <Container>
        <SectionHead id="pricing-title" eyebrow="Pricing" title="Simple packages." em="Honest terms." lead={PRICING_NOTE} />
        <div className="grid gap-4 lg:grid-cols-3">
          {PACKAGES.map((p) => <PackageCard key={p.id} pkg={p} compact />)}
        </div>
        <p className="mono mt-6 text-sm text-muted">Founding client offer: {show(SITE.foundingSlots)} slots. <a className="text-ice underline" href="/pricing#founding">Read the terms</a></p>
      </Container>
    </section>
  );
}

export function Trust(): React.JSX.Element {
  return (
    <section aria-labelledby="trust-title" className="py-24">
      <Container>
        <SectionHead id="trust-title" eyebrow="Why trust us" title="Built to be" em="easy to trust." lead="We are new, so we would rather show you how we work than ask you to take our word." />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((t) => (
            <li key={t.title} className="card p-6">
              <p className="mb-2 flex items-center gap-2 font-display text-lg font-semibold"><span aria-hidden="true" className="text-ok">✓</span>{t.title}</p>
              <p className="text-sm text-muted">{t.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function Faq({ items = FAQS }: { items?: { q: string; a: string }[] }): React.JSX.Element {
  return (
    <section aria-labelledby="faq-title" className="py-24">
      <JsonLd data={faqLd(items)} />
      <Container>
        <SectionHead id="faq-title" eyebrow="FAQ" title="Questions" em="owners ask." />
        <div className="max-w-3xl divide-y divide-border rounded-card border border-border bg-surface">
          {items.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {f.q}
                <span aria-hidden="true" className="mono text-muted transition-transform duration-200 ease-out group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Full-bleed signal band with dark text. */
export function ClosingBand({ title = "Want this running with your own business details?" }: { title?: string }): React.JSX.Element {
  return (
    <section aria-labelledby="close-title" className="mt-12 bg-signal text-signal-ink">
      <Container className="flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
        <h2 id="close-title" className="max-w-2xl text-[length:var(--fs-h2)]">
          {title} <span className="em-serif">We build it in 48 hours, free.</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/book-a-demo" variant="ink" magnetic>Book a personalised demo</ButtonLink>
          <a className="inline-flex min-h-12 items-center rounded-full border border-signal-ink px-6 font-display font-semibold" href={whatsappHref()}>WhatsApp us</a>
        </div>
      </Container>
    </section>
  );
}
