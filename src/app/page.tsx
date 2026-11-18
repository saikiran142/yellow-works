import { LazyAutopilot, LazyFrontDesk } from "@/components/demo/lazy";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Outcomes } from "@/components/home/outcomes";
import { ServicesBento } from "@/components/home/services-bento";
import { ClosingBand, Faq, HowWeWork, PricingPreview, ScanEntry, Trust } from "@/components/home/simple-sections";
import { Story } from "@/components/home/story";
import { Container, SectionHead, Shell } from "@/components/site/shell";
import { whatsappHref } from "@/content/site";

export default function Home(): React.JSX.Element {
  return (
    <Shell>
      <Hero whatsappHref={whatsappHref()} />
      <Marquee />
      <Outcomes />
      <section id="front-desk" aria-labelledby="fd-title" className="py-24">
        <Container>
          <SectionHead id="fd-title" eyebrow="Demo 1 · AI Front Desk" title="Message it like a customer." em="Watch the owner's side." lead="Ask about prices, timings or book a slot. The assistant answers from the business's own details, hands over to staff when it should, and the dashboard updates live." />
          <LazyFrontDesk />
        </Container>
      </section>
      <Story />
      <section id="autopilot" aria-labelledby="ap-title" className="py-24">
        <Container>
          <SectionHead id="ap-title" eyebrow="Demo 2 · Lead Autopilot" title="One enquiry in." em="Everything else on its own." lead="Send a sample enquiry and watch it get scored, logged, answered and followed up. Then flip to see the same lead handled by hand." />
          <LazyAutopilot />
        </Container>
      </section>
      <ServicesBento />
      <ScanEntry />
      <HowWeWork />
      <PricingPreview />
      <Trust />
      <Faq />
      <ClosingBand />
    </Shell>
  );
}
