import "server-only";

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import type { DatabaseSync } from "node:sqlite";

import type { LeadStatus } from "@/lib/leads/options";

import type { Lead, LeadStore, NewLead } from "./types";

const SCHEMA = `CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  business TEXT, industry TEXT, channel TEXT, headache TEXT, headache_note TEXT,
  whatsapp TEXT, email TEXT, preferred_time TEXT,
  consent INTEGER NOT NULL,
  scan TEXT, score INTEGER, attribution TEXT, source TEXT, campaign TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  notified INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  source TEXT,
  props TEXT
);
CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at DESC);`;

type Row = Record<string, string | number | null>;

function toLead(r: Row): Lead {
  return {
    id: r.id as string,
    idempotencyKey: r.idempotency_key as string,
    createdAt: r.created_at as string,
    kind: r.kind as Lead["kind"],
    name: r.name as string,
    business: r.business as string | null,
    industry: r.industry as string | null,
    channel: r.channel as string | null,
    headache: r.headache as string | null,
    headacheNote: r.headache_note as string | null,
    whatsapp: r.whatsapp as string | null,
    email: r.email as string | null,
    preferredTime: r.preferred_time as string | null,
    consent: r.consent === 1,
    scan: r.scan as string | null,
    score: r.score as number | null,
    attribution: r.attribution as string | null,
    source: r.source as string | null,
    campaign: r.campaign as string | null,
    status: r.status as LeadStatus,
    notes: r.notes as string,
    notified: r.notified === 1,
  };
}

export function createSqliteStore(file = process.env.SQLITE_PATH ?? "./data/leads.db"): LeadStore {
  // getBuiltinModule keeps the bundler from trying to resolve the node:sqlite scheme.
  const sqlite = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
  mkdirSync(dirname(file), { recursive: true });
  const db: DatabaseSync = new sqlite.DatabaseSync(file);
  db.exec(SCHEMA);

  const byKey = db.prepare("SELECT * FROM leads WHERE idempotency_key = ?");
  const byId = db.prepare("SELECT * FROM leads WHERE id = ?");

  return {
    async insert(l: NewLead) {
      const existing = byKey.get(l.idempotencyKey) as Row | undefined;
      if (existing) return { lead: toLead(existing), duplicate: true };
      const id = randomUUID();
      db.prepare(
        `INSERT INTO leads (id, idempotency_key, created_at, kind, name, business, industry, channel, headache, headache_note, whatsapp, email, preferred_time, consent, scan, score, attribution, source, campaign)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, l.idempotencyKey, new Date().toISOString(), l.kind, l.name, l.business, l.industry, l.channel, l.headache, l.headacheNote, l.whatsapp, l.email, l.preferredTime, l.consent ? 1 : 0, l.scan, l.score, l.attribution, l.source, l.campaign);
      return { lead: toLead(byId.get(id) as Row), duplicate: false };
    },
    async list(opts = {}) {
      const limit = Math.min(opts.limit ?? 500, 2000);
      const rows = (opts.status ? db.prepare("SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ?").all(opts.status, limit) : db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT ?").all(limit)) as Row[];
      return rows.map(toLead);
    },
    async update(id, patch) {
      if (patch.status !== undefined) db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(patch.status, id);
      if (patch.notes !== undefined) db.prepare("UPDATE leads SET notes = ? WHERE id = ?").run(patch.notes, id);
      const row = byId.get(id) as Row | undefined;
      return row ? toLead(row) : null;
    },
    async markNotified(id) {
      db.prepare("UPDATE leads SET notified = 1 WHERE id = ?").run(id);
    },
    async insertEvent(e) {
      db.prepare("INSERT INTO events (created_at, name, source, props) VALUES (?, ?, ?, ?)").run(new Date().toISOString(), e.name, e.source, e.props);
    },
    async eventSummary(days) {
      const since = new Date(Date.now() - days * 86_400_000).toISOString();
      const byEvent = db.prepare("SELECT name, COUNT(*) AS count FROM events WHERE created_at >= ? GROUP BY name ORDER BY count DESC").all(since) as { name: string; count: number }[];
      const bySource = db.prepare("SELECT COALESCE(source, 'direct') AS source, COUNT(*) AS count FROM events WHERE created_at >= ? GROUP BY 1 ORDER BY count DESC LIMIT 8").all(since) as { source: string; count: number }[];
      return { byEvent, bySource, days };
    },
    async ping() {
      db.prepare("SELECT 1").get();
    },
  };
}
