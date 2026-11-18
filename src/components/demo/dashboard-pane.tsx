"use client";

import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import { MonoStat } from "@/components/ui/counter";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { DAY_SHORT } from "@/lib/demo/i18n";
import { DAYS } from "@/lib/demo/types";

import type { Lead, useFrontDesk } from "./use-front-desk";

type FD = ReturnType<typeof useFrontDesk>;

const SAMPLE_ROWS: Lead[] = [
  { name: "Anitha R.", interest: "Price enquiry", status: "new", time: "6:15 pm" },
  { name: "Vikram S.", interest: "Booking", status: "booked", time: "4:50 pm" },
];

function StatusBadge({ lead }: { lead: Lead }): React.JSX.Element {
  if (lead.status === "needs_staff") return <Badge tone="ember">Needs staff</Badge>;
  if (lead.status === "booked") return <Badge tone="ok">Booked</Badge>;
  if (lead.status === "replying") return <Badge tone="ice">Replying</Badge>;
  return <Badge tone="neutral">New</Badge>;
}

const REASON: Record<NonNullable<Lead["handoverReason"]>, string> = {
  urgent: "Urgent message. Call this customer now.",
  complaint: "Complaint. Reply personally.",
  unsure: "The assistant was unsure and asked you to confirm.",
};

export function DashboardPane({ fd }: { fd: FD }): React.JSX.Element {
  const { lead, appointment, business } = fd;
  const days = DAYS.filter((d) => business.slots.some((s) => s.day === d) || appointment?.day === d);
  const replied = fd.repliedMs === null ? "--" : `${(fd.repliedMs / 1000).toFixed(1)} s`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonoStat label="Replied in" value={fd.pending && fd.repliedMs === null ? "…" : replied} live />
        <Badge>Demo dashboard</Badge>
      </div>

      {/* Owner notification */}
      <div aria-live="polite" className={clsx("rounded-card border p-4", lead?.status === "needs_staff" ? "border-ember/50 bg-surface" : "border-border bg-surface")}>
        <p className="text-xs text-muted">Owner notification</p>
        {!lead && <p className="mt-1 text-sm text-muted">You will be alerted here the moment a customer writes.</p>}
        {lead && lead.status === "replying" && <Skeleton className="mt-2 h-5 w-3/4" />}
        {lead && lead.status !== "replying" && (
          <p className="mt-1 text-sm">
            {lead.status === "needs_staff" ? (
              <>
                <span className="font-semibold text-ember">⚑ Needs staff.</span> {lead.handoverReason ? REASON[lead.handoverReason] : ""}
              </>
            ) : (
              <>
                <span className="font-semibold">New lead:</span> {lead.name} · {lead.interest}
              </>
            )}
          </p>
        )}
      </div>

      {/* Leads */}
      <div className="rounded-card border border-border bg-surface p-4">
        <p className="mb-3 font-display font-semibold">Leads</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-sm">
            <caption className="sr-only">Live lead table</caption>
            <thead>
              <tr className="text-xs text-muted">
                <th scope="col" className="pb-2 font-normal">Time</th>
                <th scope="col" className="pb-2 font-normal">Name</th>
                <th scope="col" className="pb-2 font-normal">Interest</th>
                <th scope="col" className="pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {lead && (
                <tr className="border-t border-border bg-surface-2/60">
                  <td className="mono py-2.5 pr-3">{lead.time}</td>
                  <td className="py-2.5 pr-3">{lead.status === "replying" ? <Skeleton className="h-4 w-20" /> : lead.name}</td>
                  <td className="py-2.5 pr-3">{lead.status === "replying" ? <Skeleton className="h-4 w-28" /> : lead.interest}</td>
                  <td className="py-2.5"><StatusBadge lead={lead} /></td>
                </tr>
              )}
              {SAMPLE_ROWS.map((r) => (
                <tr key={r.name} className="border-t border-border text-muted">
                  <td className="mono py-2.5 pr-3">{r.time}</td>
                  <td className="py-2.5 pr-3">{r.name}</td>
                  <td className="py-2.5 pr-3">{r.interest}</td>
                  <td className="py-2.5"><span className="mr-2 text-xs">Sample</span><StatusBadge lead={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!lead && <p className="mt-3 text-xs text-muted">Send a message on the left and your lead appears at the top.</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Calendar */}
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="mb-3 font-display font-semibold">Calendar</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(0, 1fr))` }}>
            {days.map((d) => (
              <div key={d} className="flex flex-col gap-1.5">
                <p className="text-xs text-muted">{DAY_SHORT[fd.lang][d]}</p>
                {business.slots
                  .filter((s) => s.day === d)
                  .map((s) => {
                    const booked = appointment?.day === d && appointment.time === s.time;
                    return (
                      <p key={s.time} className={clsx("mono rounded-sm border px-2 py-1.5 text-center text-xs", booked ? "border-transparent bg-signal font-semibold text-signal-ink" : "border-border text-muted")}>
                        {booked && <span aria-hidden="true">✓ </span>}
                        {s.time}
                        {booked && <span className="sr-only"> booked</span>}
                      </p>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="mb-3 font-display font-semibold">Reminders queue</p>
          {appointment ? (
            <ul className="flex flex-col gap-2 text-sm">
              {[
                ["Confirmation on WhatsApp", "now"],
                ["Reminder, 24 hours before", "queued"],
                ["Reminder, 2 hours before", "queued"],
                ["Review request, after visit", "queued"],
              ].map(([label, when]) => (
                <li key={label} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                  <span>{label}</span>
                  <span className="mono text-muted">{when}</span>
                </li>
              ))}
              <li className="pt-1 text-xs text-muted">Preview only. Nothing is sent to anyone.</li>
            </ul>
          ) : (
            <EmptyState title="Nothing queued" body="Book a slot in the chat to see reminders line up." />
          )}
        </div>
      </div>
    </div>
  );
}
