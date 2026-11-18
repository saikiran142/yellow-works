import { Card } from "@/components/ui/card";
import { Container, SectionHead } from "@/components/site/shell";
import { GROUP_BLURB, GROUP_LABEL, SERVICES, type ServiceGroup } from "@/content/services";

const groups: { id: ServiceGroup; n: string }[] = [
  { id: "get-found", n: "01" },
  { id: "convert", n: "02" },
  { id: "autopilot", n: "03" },
];

/** Three outcomes as large interactive cards. Bullets are read from the services content. */
export function Outcomes(): React.JSX.Element {
  return (
    <section aria-labelledby="outcomes-title" className="py-24">
      <Container>
        <SectionHead id="outcomes-title" eyebrow="What you get" title="Three outcomes." em="One system." lead="Pick the one you need most. They work best together." />
        <ul className="grid gap-4 lg:grid-cols-3">
          {groups.map((g) => (
            <li key={g.id}>
              <Card className="flex h-full flex-col gap-5">
                <p className="mono text-muted">{g.n}</p>
                <h3 className="text-[length:var(--fs-h3)]">{GROUP_LABEL[g.id]}</h3>
                <p className="text-muted">{GROUP_BLURB[g.id]}</p>
                <ul className="mt-auto flex flex-col gap-2 text-sm">
                  {SERVICES.filter((s) => s.group === g.id).slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                      {s.name}
                    </li>
                  ))}
                </ul>
                <a className="text-sm text-ice underline" href={`/services#${g.id}`}>See all in this group</a>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
