"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/lib/db/types";
import { CHANNEL_LABEL, HEADACHE_LABEL, INDUSTRY_LABEL, LEAD_STATUSES, TIME_LABEL, type Channel, type Headache, type LeadStatus, type PreferredTime } from "@/lib/leads/options";
import type { BusinessType } from "@/lib/demo/types";

function LeadRow({ lead }: { lead: Lead }): React.JSX.Element {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = status !== lead.status || notes !== lead.notes;
  const wa = lead.whatsapp?.replace(/\D/g, "");

  async function save(): Promise<void> {
    setState("saving");
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, notes }) });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <li className="card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">{lead.name}{lead.business ? ` · ${lead.business}` : ""}</p>
          <p className="mono text-muted">{new Date(lead.createdAt).toLocaleString("en-IN")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={lead.kind === "demo" ? "signal" : "ice"}>{lead.kind === "demo" ? "Demo request" : "Growth scan"}</Badge>
          {lead.score !== null && <Badge>Score {lead.score}</Badge>}
          {!lead.notified && <Badge tone="ember">Not notified</Badge>}
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {lead.industry && <div><dt className="text-muted">Industry</dt><dd>{INDUSTRY_LABEL[lead.industry as BusinessType] ?? lead.industry}</dd></div>}
        {lead.channel && <div><dt className="text-muted">Main channel</dt><dd>{CHANNEL_LABEL[lead.channel as Channel] ?? lead.channel}</dd></div>}
        {lead.headache && <div><dt className="text-muted">Headache</dt><dd>{HEADACHE_LABEL[lead.headache as Headache] ?? lead.headache}</dd></div>}
        {lead.preferredTime && <div><dt className="text-muted">Preferred time</dt><dd>{TIME_LABEL[lead.preferredTime as PreferredTime] ?? lead.preferredTime}</dd></div>}
        <div><dt className="text-muted">Source</dt><dd>{lead.source ?? "direct"}{lead.campaign ? ` / ${lead.campaign}` : ""}</dd></div>
        <div>
          <dt className="text-muted">Contact</dt>
          <dd className="flex flex-wrap gap-3">
            {wa && <a className="text-ice underline" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp {lead.whatsapp}</a>}
            {lead.email && <a className="text-ice underline" href={`mailto:${lead.email}`}>{lead.email}</a>}
          </dd>
        </div>
      </dl>
      {lead.headacheNote && <p className="text-sm text-muted">“{lead.headacheNote}”</p>}
      <div className="grid gap-3 md:grid-cols-[12rem_1fr_auto] md:items-end">
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select value={status} onChange={(e) => { setStatus(e.target.value as LeadStatus); setState("idle"); }} className="min-h-11 rounded-sm border border-border bg-surface px-3">
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Notes
          <textarea value={notes} maxLength={2000} rows={2} onChange={(e) => { setNotes(e.target.value); setState("idle"); }} className="rounded-sm border border-border bg-surface px-3 py-2" />
        </label>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={save} loading={state === "saving"} disabled={!dirty && state !== "error"} className="min-h-11">Save</Button>
          <span role="status" className="text-sm">{state === "saved" && <span className="text-ok">✓ Saved</span>}{state === "error" && <span className="text-ember">⚑ Not saved</span>}</span>
        </div>
      </div>
    </li>
  );
}

export function LeadsTable({ leads }: { leads: Lead[] }): React.JSX.Element {
  const router = useRouter();
  async function logout(): Promise<void> {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          <a className="rounded-full border border-border px-4 py-2 text-sm hover:border-muted" href="/admin">All</a>
          {LEAD_STATUSES.map((s) => <a key={s} className="rounded-full border border-border px-4 py-2 text-sm hover:border-muted" href={`/admin?status=${s}`}>{s}</a>)}
        </nav>
        <div className="flex gap-3">
          <a className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm hover:border-muted" href="/api/admin/export">Export CSV</a>
          <Button variant="ghost" onClick={logout} className="min-h-11">Sign out</Button>
        </div>
      </div>
      {leads.length === 0 ? <p className="text-muted">No leads yet.</p> : <ul className="flex flex-col gap-4">{leads.map((l) => <LeadRow key={l.id} lead={l} />)}</ul>}
    </div>
  );
}
