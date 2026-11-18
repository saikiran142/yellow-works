import "server-only";

import { randomUUID } from "node:crypto";

import type { Lead, LeadStore, NewEvent, NewLead } from "./types";

interface StoredEvent extends NewEvent {
  createdAt: string;
}

/**
 * In-memory demo store for serverless hosts with a read-only filesystem (Vercel) and no DATABASE_URL.
 * Data lives only as long as the function instance: fine for demos, not for real leads.
 * Set DATABASE_URL (Postgres) for durable storage.
 */
export function createMemoryStore(): LeadStore {
  const leads: Lead[] = [];
  const events: StoredEvent[] = [];

  return {
    async insert(l: NewLead) {
      const existing = leads.find((x) => x.idempotencyKey === l.idempotencyKey);
      if (existing) return { lead: existing, duplicate: true };
      const lead: Lead = { ...l, id: randomUUID(), createdAt: new Date().toISOString(), status: "new", notes: "", notified: false };
      leads.unshift(lead);
      return { lead, duplicate: false };
    },
    async list(opts = {}) {
      const limit = Math.min(opts.limit ?? 500, 2000);
      return leads.filter((x) => !opts.status || x.status === opts.status).slice(0, limit);
    },
    async update(id, patch) {
      const lead = leads.find((x) => x.id === id);
      if (!lead) return null;
      if (patch.status !== undefined) lead.status = patch.status;
      if (patch.notes !== undefined) lead.notes = patch.notes;
      return lead;
    },
    async markNotified(id) {
      const lead = leads.find((x) => x.id === id);
      if (lead) lead.notified = true;
    },
    async insertEvent(e) {
      events.push({ ...e, createdAt: new Date().toISOString() });
      if (events.length > 5000) events.shift();
    },
    async eventSummary(days) {
      const since = new Date(Date.now() - days * 86_400_000).toISOString();
      const recent = events.filter((e) => e.createdAt >= since);
      const tally = (key: (e: StoredEvent) => string) => {
        const m = new Map<string, number>();
        for (const e of recent) m.set(key(e), (m.get(key(e)) ?? 0) + 1);
        return [...m.entries()].sort((a, b) => b[1] - a[1]);
      };
      return {
        byEvent: tally((e) => e.name).map(([name, count]) => ({ name, count })),
        bySource: tally((e) => e.source ?? "direct").slice(0, 8).map(([source, count]) => ({ source, count })),
        days,
      };
    },
    async ping() {},
  };
}
