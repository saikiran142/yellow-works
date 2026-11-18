import { Badge } from "@/components/ui/badge";
import { Container, SectionHead } from "@/components/site/shell";

const steps = [
  { id: "arrives", label: "Arrives", time: "9:42 pm", text: "A customer writes after hours. Most businesses are closed." },
  { id: "answered", label: "Answered", time: "9:42 pm · 8 s", text: "The assistant replies in seconds, from your own details." },
  { id: "booked", label: "Booked", time: "9:43 pm", text: "The slot lands in your calendar. You are notified." },
  { id: "reminded", label: "Reminded", time: "Friday 6:00 pm", text: "A reminder goes out so the customer does not forget." },
  { id: "reviewed", label: "Reviewed", time: "Saturday 7:30 pm", text: "After the visit, a one-tap review request goes out." },
] as const;

function Bubble({ me, children }: { me?: boolean; children: React.ReactNode }): React.JSX.Element {
  return <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${me ? "self-end rounded-br-md bg-signal text-signal-ink" : "self-start rounded-bl-md bg-surface-2"}`}>{children}</p>;
}

const panels: Record<(typeof steps)[number]["id"], React.JSX.Element> = {
  arrives: (<><Badge tone="ice">New enquiry</Badge><Bubble me>Hi, is a slot free this Saturday?</Bubble></>),
  answered: (<><Bubble me>Hi, is a slot free this Saturday?</Bubble><Bubble>Hi, I&apos;m the automated assistant. Yes, Saturday 5:00 pm is free. Shall I book it?</Bubble><Badge tone="ok">Replied in 8 seconds</Badge></>),
  booked: (<><Bubble me>Yes please</Bubble><Bubble>Booked: Saturday 5:00 pm. See you then.</Bubble><div className="mono rounded-sm bg-signal px-3 py-2 text-center text-signal-ink">✓ Sat 5:00 pm</div></>),
  reminded: (<><Bubble>Reminder: your appointment is tomorrow at 5:00 pm. Reply 1 to confirm or 2 to reschedule.</Bubble><Badge>Reminder sent</Badge></>),
  reviewed: (<><Bubble>Thanks for visiting. How was it? Tap to leave a quick review.</Bubble><span className="mono text-muted" aria-hidden="true">☆ ☆ ☆ ☆ ☆</span><Badge>Request only. No review shown here.</Badge></>),
};

/**
 * One enquiry's journey. On browsers with CSS scroll-driven animations the stage pins and the
 * panels follow the scroll (see .story in globals.css). Everywhere else, and with reduced motion,
 * it renders as a plain list. Illustration on a fictional business.
 */
export function Story(): React.JSX.Element {
  return (
    <section aria-labelledby="story-title" className="story py-14 md:py-20">
      <Container>
        <SectionHead id="story-title" eyebrow="One enquiry's journey" title="From first message to" em="five-star review." lead="Scroll to follow a single enquiry. This is an illustration on a fictional business." />
      </Container>
      <div className="story-track">
        <div className="story-stage">
          <Container className="story-grid">
            <ol className="story-steps">
              {steps.map((s, i) => (
                <li key={s.id} className="story-step" style={{ "--i": i } as React.CSSProperties}>
                  <p className="mono text-muted">{String(i + 1).padStart(2, "0")} · {s.time}</p>
                  <p className="font-display text-xl font-semibold">{s.label}</p>
                  <p className="text-sm text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="story-device card glass" role="img" aria-label="Illustration of the enquiry at each step">
              {steps.map((s, i) => (
                <div key={s.id} className="story-panel" style={{ "--i": i } as React.CSSProperties} aria-hidden="true">
                  <p className="mono mb-3 text-muted">{s.label} · {s.time}</p>
                  <div className="flex flex-col items-start gap-3">{panels[s.id]}</div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
