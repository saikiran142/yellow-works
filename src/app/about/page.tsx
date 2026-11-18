import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { ClosingBand, HowWeWork, Trust } from "@/components/home/simple-sections";
import { Container, SectionHead, Shell } from "@/components/site/shell";
import { SITE, show } from "@/content/site";

export const metadata: Metadata = pageMeta({ title: "About", description: "The Yellow Works is a founder-led AI automation and digital growth studio in Hyderabad. Meet the team, see our process and our registered business details.", path: "/about" });

/** Founders are placeholders until real names, roles and photos are supplied. No invented people. */
const founders = [1, 2].map((n) => ({ id: n, name: `Founder ${n} name`, role: "role" }));

export default function AboutPage(): React.JSX.Element {
  return (
    <Shell>
      <Container className="pb-8 pt-16">
        <p className="mono mb-3 text-muted">About</p>
        <h1 className="mb-4 max-w-4xl text-[length:var(--fs-h1)]">A small studio in Hyderabad, <span className="em-serif">built around your enquiries.</span></h1>
        <p className="max-w-2xl text-muted">We help small and mid-sized businesses get more customers with less manual work, using websites, marketing and AI systems. We are founder-led and new, so we show you how it works instead of asking you to trust a logo wall.</p>
      </Container>

      <section aria-labelledby="founders-title" className="py-16">
        <Container>
          <SectionHead id="founders-title" eyebrow="The people" title="Who you will" em="work with." />
          <ul className="grid gap-4 md:grid-cols-2">
            {founders.map((f) => (
              <li key={f.id} className="card flex items-center gap-5 p-6">
                <span aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-full border border-dashed border-border text-xs text-muted">photo</span>
                <div>
                  <p className="font-display text-xl font-semibold">[{f.name}]</p>
                  <p className="text-sm text-muted">[{f.role}]</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <HowWeWork />
      <Trust />

      <section aria-labelledby="reg-title" className="py-16">
        <Container>
          <SectionHead id="reg-title" eyebrow="Registered business" title="Company" em="details." />
          <dl className="card grid max-w-2xl gap-4 p-6 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Legal entity</dt><dd>{show(SITE.legalEntity)}</dd></div>
            <div><dt className="text-muted">Registration</dt><dd>{show(SITE.registration)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted">Registered address</dt><dd>{show(SITE.address)}</dd></div>
            <div><dt className="text-muted">Email</dt><dd>{show(SITE.email)}</dd></div>
            <div><dt className="text-muted">WhatsApp</dt><dd>{show(SITE.whatsapp)}</dd></div>
          </dl>
        </Container>
      </section>
      <ClosingBand />
    </Shell>
  );
}
