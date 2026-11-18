import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import type { AutopilotResult } from "@/lib/autopilot/engine";

interface Props {
  result: AutopilotResult | null;
  mode: "auto" | "manual";
  doneIds: string[];
  phase: "idle" | "loading" | "running" | "done";
}

function Card({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="step-in rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold">{title}</p>
        {tag && <Badge>{tag}</Badge>}
      </div>
      {children}
    </div>
  );
}

function Pending(): React.JSX.Element {
  return (
    <div className="rounded-card border border-border bg-surface p-4" aria-hidden="true">
      <Skeleton className="mb-2 h-4 w-1/3" />
      <Skeleton className="mb-1.5" />
      <Skeleton className="w-4/5" />
    </div>
  );
}

/** Side panel: each message preview appears when its workflow step completes. Nothing is sent. */
export function Previews({ result, mode, doneIds, phase }: Props): React.JSX.Element {
  if (!result) return <EmptyState title="Message previews" body="The replies, alerts and follow-ups this enquiry triggers will appear here." />;
  const p = result.previews;
  const done = (id: string): boolean => doneIds.includes(id);
  const running = phase === "running";

  if (mode === "manual") {
    return (
      <div className="flex flex-col gap-3" aria-live="polite">
        {done("replied") ? (
          <Card title="WhatsApp reply" tag="Illustration">
            <p className="rounded-sm bg-surface-2 px-3 py-2 text-sm">{p.lateWhatsapp}</p>
            <p className="mono mt-2 text-muted">sent 10:40 am next day</p>
          </Card>
        ) : running ? (
          <Pending />
        ) : null}
        {phase === "done" && <EmptyState title="Nothing else was drafted" body="No email, no staff alert, no follow-ups and no report entry." />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      {done("reply") ? (
        <>
          <Card title="WhatsApp reply" tag="Preview">
            <p className="rounded-sm bg-surface-2 px-3 py-2 text-sm">{p.whatsapp}</p>
          </Card>
          <Card title="Email reply" tag="Preview">
            <p className="text-sm font-medium">{p.email.subject}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted">{p.email.body}</p>
          </Card>
        </>
      ) : running ? (
        <Pending />
      ) : null}
      {done("alert") ? (
        <Card title="Staff alert" tag="Preview">
          <p className="text-sm">{p.staff}</p>
        </Card>
      ) : running && done("reply") ? (
        <Pending />
      ) : null}
      {done("followups") ? (
        <Card title="Follow-ups scheduled" tag="Queued">
          <ul className="flex flex-col gap-2 text-sm">
            {p.followups.map((f) => (
              <li key={f.day}>
                <span className="mono text-muted">{f.day} · {f.channel}</span>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {done("report") ? (
        <Card title="Weekly report card">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {p.report.map((r) => (
              <div key={r.label}>
                <dt className="text-xs text-muted">{r.label}</dt>
                <dd className="mono">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}
    </div>
  );
}
