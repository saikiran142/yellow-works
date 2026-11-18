import { Container, SectionHead } from "@/components/site/shell";
import { Bento, Card } from "@/components/ui/card";
import { GROUP_LABEL, SERVICES } from "@/content/services";

/** Presentational spans only; copy comes from the services content. DOM order = reading order. */
const SPAN: Record<string, string> = {
  websites: "lg:col-span-6",
  "local-search": "lg:col-span-3",
  "ai-search": "lg:col-span-3",
  ads: "lg:col-span-4",
  content: "lg:col-span-4",
  "whatsapp-assistant": "lg:col-span-4 lg:row-span-2",
  "website-assistant": "lg:col-span-4",
  "lead-follow-up": "lg:col-span-4",
  booking: "lg:col-span-4",
  reviews: "lg:col-span-4",
  automation: "lg:col-span-4",
  crm: "lg:col-span-4",
  "weekly-report": "lg:col-span-4",
};

export function ServicesBento(): React.JSX.Element {
  const main = SERVICES.filter((s) => s.group !== "on-request");
  const onRequest = SERVICES.filter((s) => s.group === "on-request");
  return (
    <section aria-labelledby="bento-title" className="py-24">
      <Container>
        <SectionHead id="bento-title" eyebrow="Services" title="Everything you need," em="nothing you don't." lead="Grouped by what you want to happen. Start with one, add more when you are ready." />
        <Bento>
          {main.map((s) => (
            <Card key={s.id} className={`md:col-span-3 ${SPAN[s.id] ?? "lg:col-span-4"} flex flex-col gap-2 p-5 md:p-6`}>
              <p className="mono text-muted">{GROUP_LABEL[s.group]}</p>
              <h3 className="font-display text-lg font-semibold leading-snug">{s.name}</h3>
              <p className="text-sm text-muted">{s.summary}</p>
              <a className="mt-auto pt-2 text-sm text-ice underline" href={`/services#${s.id}`}>Details<span className="sr-only"> for {s.name}</span></a>
            </Card>
          ))}
        </Bento>
        <div className="mt-6 rounded-card border border-dashed border-border p-5">
          <p className="mono mb-2 text-muted">On request</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {onRequest.map((s) => (
              <li key={s.id}><a className="underline-offset-4 hover:underline" href={`/services#${s.id}`}>{s.name}</a></li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
