import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import type { Personalisation } from "@/lib/personalise/rules";

const TYPE_LABEL: Record<Personalisation["type"], string> = {
  clinic: "Clinic",
  "real-estate": "Real estate",
  education: "Education",
  "salon-fitness": "Salon and fitness",
  restaurant: "Restaurant",
  store: "Store",
  services: "Services",
};

export function PersonalisedPanel({ persona, onReset }: { persona: Personalisation; onReset: () => void }): React.JSX.Element {
  return (
    <div className="card step-in flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="signal">{TYPE_LABEL[persona.type]}</Badge>
        <Badge>Demo</Badge>
      </div>
      <h2 className="text-[length:var(--fs-h3)] leading-tight">
        This is how <span className="em-serif">{persona.businessName}</span> would answer an enquiry at <span className="mono">9:42 pm</span>.
      </h2>

      <div className="flex flex-col gap-2 rounded-card bg-surface-2 p-4">
        <p className="text-xs text-muted">{persona.businessName} · automated assistant</p>
        <p className="max-w-[85%] rounded-sm bg-surface px-4 py-2.5 text-sm">{persona.greeting}</p>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted">Customers like yours often ask:</p>
        <ul className="flex flex-col gap-2">
          {persona.questions.map((q) => (
            <li key={q} className="rounded-sm border border-border bg-surface px-4 py-2.5 text-sm">
              {q}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href="/book-a-demo" className="min-h-10">
          Get this for {persona.businessName}
        </ButtonLink>
        <Button variant="ghost" onClick={onReset} className="min-h-10">
          Try another
        </Button>
      </div>
      <p className="text-xs text-muted">
        {persona.source === "ai" ? "Questions drafted by AI." : "Questions picked by a simple rule."} Names and text are not saved.
      </p>
    </div>
  );
}
