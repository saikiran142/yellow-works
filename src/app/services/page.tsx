import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { ClosingBand } from "@/components/home/simple-sections";
import { JsonLd, serviceLd } from "@/components/seo/json-ld";
import { Container, Shell } from "@/components/site/shell";
import { PACKAGES } from "@/content/packages";
import { GROUP_BLURB, GROUP_LABEL, SERVICES, type ServiceGroup } from "@/content/services";
import { allServiceIds } from "@/components/home/package-card";

export const metadata: Metadata = pageMeta({ title: "Services", description: "Websites, local search, ads, WhatsApp and website AI assistants, follow-up, booking, reviews, automation, CRM and reports, grouped by what you want to happen.", path: "/services" });

const order: ServiceGroup[] = ["get-found", "convert", "autopilot", "on-request"];

export default function ServicesPage(): React.JSX.Element {
  return (
    <Shell>
      {SERVICES.map((s) => <JsonLd key={s.id} data={serviceLd(s)} />)}
      <Container className="pb-8 pt-16">
        <p className="mono mb-3 text-muted">Services</p>
        <h1 className="mb-4 max-w-4xl text-[length:var(--fs-h1)]">
          Get found. Convert every enquiry. <span className="em-serif">Run on autopilot.</span>
        </h1>
        <p className="max-w-2xl text-muted">Each service says what problem it solves, what you get and which packages include it. Prices are on the <a className="text-ice underline" href="/pricing">pricing page</a>.</p>
        <nav aria-label="Service groups" className="mt-8 flex flex-wrap gap-2">
          {order.map((g) => <a key={g} href={`#${g}`} className="rounded-full border border-border px-4 py-2 text-sm hover:border-muted">{GROUP_LABEL[g]}</a>)}
        </nav>
      </Container>

      {order.map((g) => (
        <section key={g} id={g} aria-labelledby={`${g}-title`} className="scroll-mt-24 py-12">
          <Container>
            <h2 id={`${g}-title`} className="mb-2 text-[length:var(--fs-h2)]">{GROUP_LABEL[g]}</h2>
            <p className="mb-8 max-w-2xl text-muted">{GROUP_BLURB[g]}</p>
            <div className="flex flex-col gap-6">
              {SERVICES.filter((s) => s.group === g).map((s) => {
                const inPackages = PACKAGES.filter((p) => allServiceIds(p).includes(s.id)).map((p) => p.name);
                return (
                  <article key={s.id} id={s.id} className="card scroll-mt-24 grid gap-6 p-6 md:p-8 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <h3 className="mb-3 text-[length:var(--fs-h3)]">{s.name}</h3>
                      <p>{s.answer}</p>
                    </div>
                    <div className="flex flex-col gap-4 lg:col-span-7">
                      <div><p className="mono mb-1 text-muted">The problem</p><p className="text-sm">{s.problem}</p></div>
                      <div>
                        <p className="mono mb-1 text-muted">What you get</p>
                        <ul className="flex flex-col gap-1.5 text-sm">{s.gets.map((x) => <li key={x} className="flex gap-2"><span aria-hidden="true" className="text-ok">✓</span>{x}</li>)}</ul>
                      </div>
                      <p className="text-sm"><span className="mono text-muted">Included in </span>{inPackages.length ? inPackages.join(", ") : "on request"}<span className="mono text-muted"> · Stand-alone price </span>₹[to confirm]</p>
                      <div className="divide-y divide-border rounded-sm border border-border">
                        {s.faq.map((f) => (
                          <details key={f.q} className="p-3 text-sm"><summary className="cursor-pointer font-medium">{f.q}</summary><p className="mt-2 text-muted">{f.a}</p></details>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ))}
      <ClosingBand />
    </Shell>
  );
}
