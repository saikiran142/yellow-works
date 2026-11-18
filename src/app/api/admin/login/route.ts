import { NextResponse } from "next/server";

import { ADMIN_COOKIE, adminConfigured, cookieOptions, createSessionToken, passwordOk } from "@/lib/admin/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  if (!rateLimit(`admin-login:${clientIp(req)}`, 5, 600_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !passwordOk(body.password)) return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), cookieOptions);
  return res;
}
