import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { ClosingBand } from "@/components/home/simple-sections";
import { Container, Shell } from "@/components/site/shell";
import { Card } from "@/components/ui/card";
import { INDUSTRIES } from "@/content/industries";

export const metadata: Metadata = pageMeta({ title: "Industries", description: "How we help clinics, real-estate teams, education centres, salons and gyms, restaurants, stores and local service businesses get more customers with less manual work.", path: "/industries" });

export default function IndustriesPage(): React.JSX.Element {
  return (
    <Shell>
      <Container className="pb-8 pt-16">
        <p className="mono mb-3 text-muted">Industries</p>
        <h1 className="mb-4 max-w-4xl text-[length:var(--fs-h1)]">Built for <span className="em-serif">businesses like yours.</span></h1>
        <p className="mb-10 max-w-2xl text-muted">Same services, tuned to each industry&apos;s problems, with a demo that starts on your kind of business.</p>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((i) => (
            <li key={i.slug}>
              <Card className="flex h-full flex-col gap-3">
                <h2 className="text-[length:var(--fs-h3)]">{i.name}</h2>
                <p className="text-muted">{i.headline}</p>
                <a className="mt-auto text-sm text-ice underline" href={`/industries/${i.slug}`}>See how it works for {i.plural}</a>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
      <ClosingBand />
    </Shell>
  );
}
