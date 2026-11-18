import { NextResponse } from "next/server";

import { getLeadStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Health check for uptime monitors and deploy gates. Reports config presence, never values. */
export async function GET(): Promise<NextResponse> {
  let db: "ok" | "down" = "ok";
  try {
    await getLeadStore().ping();
  } catch {
    db = "down";
  }
  const body = {
    status: db === "ok" ? "ok" : "degraded",
    db,
    llm: process.env.LLM_API_KEY ? "configured" : "scripted-fallback",
    webhook: process.env.LEAD_WEBHOOK_URL ? "configured" : "off",
    admin: process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET ? "on" : "off",
    time: new Date().toISOString(),
  };
  return NextResponse.json(body, { status: db === "ok" ? 200 : 503, headers: { "cache-control": "no-store" } });
}
