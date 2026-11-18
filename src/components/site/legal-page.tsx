import { Container, Shell } from "@/components/site/shell";
import { Badge } from "@/components/ui/badge";
import { LEGAL_NOTICE, type LegalSection } from "@/content/legal";

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }): React.JSX.Element {
  return (
    <Shell>
      <Container className="max-w-3xl pb-8 pt-16">
        <Badge tone="ember" className="mb-4">Draft template</Badge>
        <h1 className="mb-3 text-[length:var(--fs-h1)]">{title}</h1>
        <p className="mb-10 text-sm text-muted">{LEGAL_NOTICE}</p>
        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-2 text-[length:var(--fs-h3)]">{s.heading}</h2>
              {s.body.map((p) => <p key={p} className="mb-2 text-muted">{p}</p>)}
            </section>
          ))}
        </div>
      </Container>
    </Shell>
  );
}
