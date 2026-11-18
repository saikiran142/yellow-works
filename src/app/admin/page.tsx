import type { Metadata } from "next";

import { LeadsTable } from "@/components/admin/leads-table";
import { LoginForm } from "@/components/admin/login-form";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import { getLeadStore } from "@/lib/db";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/options";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }): Promise<React.JSX.Element> {
  const { status } = await searchParams;
  let body: React.JSX.Element;

  if (!adminConfigured()) {
    body = <p className="text-muted">Admin is off. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in the environment to turn it on.</p>;
  } else if (!(await isAdmin())) {
    body = <LoginForm />;
  } else {
    const filter = LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : undefined;
    const store = getLeadStore();
    const [leads, summary] = await Promise.all([store.list({ status: filter }), store.eventSummary(30)]);
    body = (
      <div className="flex flex-col gap-10">
        <section aria-labelledby="funnel-title" className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h2 id="funnel-title" className="mb-3 font-display text-lg font-semibold">Funnel events, last {summary.days} days</h2>
            {summary.byEvent.length === 0 ? <p className="text-sm text-muted">No events yet.</p> : (
              <ul className="flex flex-col gap-1.5 text-sm">{summary.byEvent.map((e) => <li key={e.name} className="flex justify-between"><span>{e.name.replace(/_/g, " ")}</span><span className="mono">{e.count}</span></li>)}</ul>
            )}
          </div>
          <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">By source</h2>
            {summary.bySource.length === 0 ? <p className="text-sm text-muted">No events yet.</p> : (
              <ul className="flex flex-col gap-1.5 text-sm">{summary.bySource.map((e) => <li key={e.source} className="flex justify-between"><span>{e.source}</span><span className="mono">{e.count}</span></li>)}</ul>
            )}
          </div>
        </section>
        <LeadsTable leads={leads} />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-[var(--gutter)] py-16">
      <h1 className="mb-8 text-[length:var(--fs-h2)]">Leads</h1>
      {body}
    </main>
  );
}
