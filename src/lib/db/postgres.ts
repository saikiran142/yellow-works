import "server-only";

import { randomUUID } from "node:crypto";

import postgres from "postgres";

import type { LeadStatus } from "@/lib/leads/options";

import type { Lead, LeadStore, NewLead } from "./types";

type Row = {
  id: string; idempotency_key: string; created_at: Date | string; kind: "demo" | "scan"; name: string;
  business: string | null; industry: string | null; channel: string | null; headache: string | null; headache_note: string | null;
  whatsapp: string | null; email: string | null; preferred_time: string | null; consent: boolean;
  scan: string | null; score: number | null; attribution: string | null; source: string | null; campaign: string | null;
  status: LeadStatus; notes: string; notified: boolean;
};

const toLead = (r: Row): Lead => ({
  id: r.id, idempotencyKey: r.idempotency_key, createdAt: new Date(r.created_at).toISOString(), kind: r.kind, name: r.name,
  business: r.business, industry: r.industry, channel: r.channel, headache: r.headache, headacheNote: r.headache_note,
  whatsapp: r.whatsapp, email: r.email, preferredTime: r.preferred_time, consent: r.consent,
  scan: r.scan, score: r.score, attribution: r.attribution, source: r.source, campaign: r.campaign,
  status: r.status, notes: r.notes, notified: r.notified,
});

export function createPostgresStore(url: string): LeadStore {
  const sql = postgres(url, { max: 3, idle_timeout: 20, ssl: "require" });
  let ready: Promise<unknown> | null = null;
  const init = (): Promise<unknown> =>
    (ready ??= sql`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), kind TEXT NOT NULL, name TEXT NOT NULL,
      business TEXT, industry TEXT, channel TEXT, headache TEXT, headache_note TEXT, whatsapp TEXT, email TEXT, preferred_time TEXT,
      consent BOOLEAN NOT NULL, scan TEXT, score INTEGER, attribution TEXT, source TEXT, campaign TEXT,
      status TEXT NOT NULL DEFAULT 'new', notes TEXT NOT NULL DEFAULT '', notified BOOLEAN NOT NULL DEFAULT false
    )`
      .then(() => sql`CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC)`)
      .then(() => sql`CREATE TABLE IF NOT EXISTS events (id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), name TEXT NOT NULL, source TEXT, props TEXT)`)
      .then(() => sql`CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at DESC)`));

  return {
    async insert(l: NewLead) {
      await init();
      const id = randomUUID();
      const rows = await sql<Row[]>`
        INSERT INTO leads (id, idempotency_key, kind, name, business, industry, channel, headache, headache_note, whatsapp, email, preferred_time, consent, scan, score, attribution, source, campaign)
        VALUES (${id}, ${l.idempotencyKey}, ${l.kind}, ${l.name}, ${l.business}, ${l.industry}, ${l.channel}, ${l.headache}, ${l.headacheNote}, ${l.whatsapp}, ${l.email}, ${l.preferredTime}, ${l.consent}, ${l.scan}, ${l.score}, ${l.attribution}, ${l.source}, ${l.campaign})
        ON CONFLICT (idempotency_key) DO NOTHING RETURNING *`;
      if (rows[0]) return { lead: toLead(rows[0]), duplicate: false };
      const existing = await sql<Row[]>`SELECT * FROM leads WHERE idempotency_key = ${l.idempotencyKey}`;
      return { lead: toLead(existing[0] as Row), duplicate: true };
    },
    async list(opts = {}) {
      await init();
      const limit = Math.min(opts.limit ?? 500, 2000);
      const rows = opts.status ? await sql<Row[]>`SELECT * FROM leads WHERE status = ${opts.status} ORDER BY created_at DESC LIMIT ${limit}` : await sql<Row[]>`SELECT * FROM leads ORDER BY created_at DESC LIMIT ${limit}`;
      return rows.map(toLead);
    },
    async update(id, patch) {
      await init();
      if (patch.status !== undefined) await sql`UPDATE leads SET status = ${patch.status} WHERE id = ${id}`;
      if (patch.notes !== undefined) await sql`UPDATE leads SET notes = ${patch.notes} WHERE id = ${id}`;
      const rows = await sql<Row[]>`SELECT * FROM leads WHERE id = ${id}`;
      return rows[0] ? toLead(rows[0]) : null;
    },
    async markNotified(id) {
      await init();
      await sql`UPDATE leads SET notified = true WHERE id = ${id}`;
    },
    async insertEvent(e) {
      await init();
      await sql`INSERT INTO events (name, source, props) VALUES (${e.name}, ${e.source}, ${e.props})`;
    },
    async eventSummary(days) {
      await init();
      const since = new Date(Date.now() - days * 86_400_000);
      const byEvent = await sql<{ name: string; count: number }[]>`SELECT name, COUNT(*)::int AS count FROM events WHERE created_at >= ${since} GROUP BY name ORDER BY count DESC`;
      const bySource = await sql<{ source: string; count: number }[]>`SELECT COALESCE(source, 'direct') AS source, COUNT(*)::int AS count FROM events WHERE created_at >= ${since} GROUP BY 1 ORDER BY count DESC LIMIT 8`;
      return { byEvent: [...byEvent], bySource: [...bySource], days };
    },
    async ping() {
      await sql`SELECT 1`;
    },
  };
}
