import { Badge } from "@/components/ui/badge";

const steps = [
  { t: "9:42 pm", text: "New enquiry on WhatsApp: “Is a slot free this Saturday?”", tone: "text-text" },
  { t: "9:42 pm", text: "Replied in 8 seconds", tone: "text-ok", icon: "✓" },
  { t: "9:43 pm", text: "Booked: Saturday, 5:00 pm", tone: "text-ok", icon: "✓" },
  { t: "9:43 pm", text: "Owner notified · reminder set for Friday", tone: "text-text", icon: "→" },
];

/** Live "enquiry caught" card. Plays once via CSS; reduced motion shows the final state. Fictional business. */
export function EnquiryCaught(): React.JSX.Element {
  return (
    <div className="card relative overflow-hidden p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true" className="live-dot size-2.5 rounded-full bg-signal" />
          Enquiry caught
        </span>
        <Badge>Demo</Badge>
      </div>
      <ol className="flex flex-col gap-4">
        {steps.map((s, i) => (
          <li key={s.text} className="step-in flex items-start gap-3" style={{ animationDelay: `${900 + i * 1100}ms` }}>
            <span className="mono mt-0.5 w-16 shrink-0 text-muted">{s.t}</span>
            <span className={`text-sm ${s.tone}`}>
              {s.icon && <span aria-hidden="true">{s.icon} </span>}
              {s.text}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 border-t border-border pt-4 text-xs text-muted">Example business. Type yours on the left to see your own.</p>
    </div>
  );
}
