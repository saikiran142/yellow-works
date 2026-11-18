import type { LeadStatus } from "@/lib/leads/options";

export interface Lead {
  id: string;
  idempotencyKey: string;
  createdAt: string;
  kind: "demo" | "scan";
  name: string;
  business: string | null;
  industry: string | null;
  channel: string | null;
  headache: string | null;
  headacheNote: string | null;
  whatsapp: string | null;
  email: string | null;
  preferredTime: string | null;
  consent: boolean;
  /** JSON string: scan answers, score, value at risk. */
  scan: string | null;
  score: number | null;
  /** JSON string: utm_* and referrer. */
  attribution: string | null;
  source: string | null;
  campaign: string | null;
  status: LeadStatus;
  notes: string;
  notified: boolean;
}

export type NewLead = Omit<Lead, "id" | "createdAt" | "status" | "notes" | "notified">;

export interface NewEvent {
  name: string;
  source: string | null;
  /** JSON string of small, non-personal properties. */
  props: string | null;
}

export interface EventSummary {
  byEvent: { name: string; count: number }[];
  bySource: { source: string; count: number }[];
  days: number;
}

/** Thin storage interface. SQLite locally, Postgres when DATABASE_URL is set. */
export interface LeadStore {
  insert(lead: NewLead): Promise<{ lead: Lead; duplicate: boolean }>;
  list(opts?: { status?: LeadStatus; limit?: number }): Promise<Lead[]>;
  update(id: string, patch: { status?: LeadStatus; notes?: string }): Promise<Lead | null>;
  markNotified(id: string): Promise<void>;
  /** Cookieless funnel events: no IP, no free text, no user id. */
  insertEvent(e: NewEvent): Promise<void>;
  eventSummary(days: number): Promise<EventSummary>;
  /** Cheap round trip used by /api/health. */
  ping(): Promise<void>;
}
