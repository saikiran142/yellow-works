import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { PackageCard } from "@/components/home/package-card";
import { ClosingBand, Faq } from "@/components/home/simple-sections";
import { Container, Shell } from "@/components/site/shell";
import { FAQS } from "@/content/faqs";
import { PACKAGES, PRICING_NOTE } from "@/content/packages";
import { SITE, show } from "@/content/site";

export const metadata: Metadata = pageMeta({ title: "Pricing", description: "Three packages: Launch, Front Desk and Growth. One-time set-up, simple monthly fees, and platform, messaging and ad charges paid by you directly.", path: "/pricing" });

export default function PricingPage(): React.JSX.Element {
  return (
    <Shell>
      <Container className="pb-8 pt-16">
        <p className="mono mb-3 text-muted">Pricing</p>
        <h1 className="mb-4 max-w-4xl text-[length:var(--fs-h1)]">Three packages. <span className="em-serif">No surprises.</span></h1>
        <p className="mb-10 max-w-2xl text-muted">{PRICING_NOTE}</p>
        <h2 className="sr-only">The three packages</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {PACKAGES.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
        <p className="mono mt-4 text-sm text-muted">Amounts in [square brackets] are not final yet.</p>

        <section id="founding" aria-labelledby="founding-title" className="card mt-12 scroll-mt-24 p-6 md:p-8">
          <p className="mono mb-2 text-muted">Founding client offer</p>
          <h2 id="founding-title" className="mb-3 text-[length:var(--fs-h2)]">{show(SITE.foundingSlots)} slots. <span className="em-serif">Real terms.</span></h2>
          <p className="text-muted">We are opening with a small number of founding clients. Terms: {show(SITE.foundingTerms)}.</p>
          <p className="mt-3 text-sm text-muted">After an initial term of {show(SITE.initialTerm)}, everything is month-to-month. Accounts and data stay in your name.</p>
        </section>
      </Container>
      <Faq items={FAQS.filter((f) => /cost|locked|guarantee/i.test(f.q))} />
      <ClosingBand />
    </Shell>
  );
}
