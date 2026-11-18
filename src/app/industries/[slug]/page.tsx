import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageMeta } from "@/lib/seo";
import { LazyFrontDesk } from "@/components/demo/lazy";
import { ClosingBand } from "@/components/home/simple-sections";
import { Container, SectionHead, Shell } from "@/components/site/shell";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INDUSTRIES, getIndustry } from "@/content/industries";
import { getService } from "@/content/services";

export function generateStaticParams(): { slug: string }[] {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const i = getIndustry((await params).slug);
  if (!i) return {};
  return pageMeta({ title: `AI automation for ${i.plural}`, description: `${i.headline} ${i.intro}`, path: `/industries/${i.slug}` });
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const industry = getIndustry((await params).slug);
  if (!industry) notFound();
  const services = industry.services.map((id) => getService(id)).filter((s) => s !== undefined);

  return (
    <Shell>
      <Container className="pb-8 pt-16">
        <p className="mono mb-3 text-muted">For {industry.plural}</p>
        <h1 className="mb-4 max-w-4xl text-[length:var(--fs-h1)]">{industry.headline}</h1>
        <p className="mb-8 max-w-2xl text-muted">{industry.intro}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/book-a-demo" magnetic>Book a personalised demo</ButtonLink>
          <ButtonLink href="/growth-scan" variant="secondary">Get a free growth scan</ButtonLink>
        </div>
      </Container>

      <section aria-labelledby="problems-title" className="py-16">
        <Container>
          <SectionHead id="problems-title" eyebrow="Sound familiar?" title={`Common problems for ${industry.plural}`} />
          <ul className="grid gap-4 md:grid-cols-3">
            {industry.problems.map((p) => <li key={p} className="card p-6">{p}</li>)}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="fit-title" className="py-16">
        <Container>
          <SectionHead id="fit-title" eyebrow="What helps most" title="The services that fit" em={industry.plural + "."} />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.id}>
                <Card className="flex h-full flex-col gap-2">
                  <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted">{s.summary}</p>
                  <a className="mt-auto pt-2 text-sm text-ice underline" href={`/services#${s.id}`}>Details<span className="sr-only"> for {s.name}</span></a>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="demo-title" className="py-16">
        <Container>
          <SectionHead id="demo-title" eyebrow="Demo" title="Try it on a" em={`${industry.name.toLowerCase()} business.`} lead="A fictional business, labelled Demo. Nothing is sent to anyone." />
          <LazyFrontDesk defaultType={industry.slug} />
        </Container>
      </section>
      <ClosingBand />
    </Shell>
  );
}
