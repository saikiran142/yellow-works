import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { LazyAutopilot, LazyFrontDesk } from "@/components/demo/lazy";
import { Container, SectionHead, Shell } from "@/components/site/shell";

export const metadata: Metadata = pageMeta({ title: "Demos", description: "Try the AI Front Desk as a customer, then watch Lead Autopilot handle an enquiry from capture to follow-up.", path: "/demos" });

export default function DemosPage(): React.JSX.Element {
  return (
    <Shell>
      <Container className="pt-16">
        <p className="mono mb-3 text-muted">Demo 1 · AI Front Desk</p>
        <h1 className="mb-10 max-w-3xl text-[length:var(--fs-h1)]">
          Try it <span className="em-serif">yourself.</span>
        </h1>
        <LazyFrontDesk />
      </Container>
      <Container className="pt-24">
        <SectionHead eyebrow="Demo 2 · Lead Autopilot" title="See what happens" em="after the enquiry." />
        <LazyAutopilot />
      </Container>
    </Shell>
  );
}
