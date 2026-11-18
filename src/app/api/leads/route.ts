import { NextResponse } from "next/server";

import { getLeadStore } from "@/lib/db";
import { demoToNewLead, scanToNewLead } from "@/lib/leads/map";
import { notifyLead } from "@/lib/leads/notify";
import { demoLeadSchema, scanLeadSchema } from "@/lib/leads/schema";
import { log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const MIN_FILL_MS = 2500;

/**
 * Lead intake for "Book a demo" and "Growth Scan".
 * - Validated with zod; honeypot and too-fast submissions are acknowledged silently and dropped.
 * - Idempotent on idempotencyKey: a retry returns the same lead and does not notify twice.
 * - Rate limited per IP. Logs never contain names, numbers or emails.
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(`leads:${clientIp(req)}`, 6, 600_000)) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });
  }
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !("kind" in body)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = (body as { kind: unknown }).kind === "scan" ? scanLeadSchema.safeParse(body) : demoLeadSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".") || "form"] ??= issue.message;
    return NextResponse.json({ error: "Please check the highlighted fields.", fields }, { status: 400 });
  }
  const input = parsed.data;

  // Bots: pretend success, store nothing.
  if (input.company_website || (input.elapsedMs !== undefined && input.elapsedMs < MIN_FILL_MS)) {
    log("info", "lead_dropped", { reason: input.company_website ? "honeypot" : "too_fast" });
    return NextResponse.json({ ok: true, id: "ok" });
  }

  try {
    const store = getLeadStore();
    const { lead, duplicate } = await store.insert(input.kind === "scan" ? scanToNewLead(input) : demoToNewLead(input));
    if (!duplicate) {
      const sent = await notifyLead(lead);
      if (sent) await store.markNotified(lead.id);
      log("info", "lead_created", { id: lead.id, kind: lead.kind, source: lead.source, notified: sent });
    }
    return NextResponse.json({ ok: true, id: lead.id, duplicate });
  } catch (err) {
    log("error", "lead_store_failed", { error: err instanceof Error ? err.message : "unknown" });
    return NextResponse.json({ error: "We could not save that just now. Please try again, or message us on WhatsApp." }, { status: 503 });
  }
}
