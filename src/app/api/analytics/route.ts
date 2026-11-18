import { NextResponse } from "next/server";
import { z } from "zod";

import { getLeadStore } from "@/lib/db";
import { log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const EVENT_NAMES = ["hero_personalised", "demo_started", "demo_completed", "industry_switched", "scan_completed", "demo_booked", "whatsapp_clicked"] as const;

const schema = z.object({
  name: z.enum(EVENT_NAMES),
  source: z.string().max(60).optional(),
  props: z.record(z.string().max(40), z.union([z.string().max(60), z.number(), z.boolean()])).optional(),
});

/**
 * Cookieless first-party funnel events. Stored: event name, source label, a few small props.
 * Never stored: IP, user id, free text. Failures are swallowed; analytics must never break the page.
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(`analytics:${clientIp(req)}`, 60, 60_000)) return new NextResponse(null, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { name, source, props } = parsed.data;
  try {
    await getLeadStore().insertEvent({ name, source: source ?? null, props: props ? JSON.stringify(props) : null });
  } catch (err) {
    log("warn", "event_store_failed", { name, error: err instanceof Error ? err.message : "unknown" });
  }
  return new NextResponse(null, { status: 204 });
}
