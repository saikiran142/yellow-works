import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdmin } from "@/lib/admin/auth";
import { getLeadStore } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/leads/options";

export const runtime = "nodejs";

const patch = z.object({ status: z.enum(LEAD_STATUSES).optional(), notes: z.string().max(2000).optional() });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  const parsed = patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  const { id } = await ctx.params;
  const lead = await getLeadStore().update(id, parsed.data);
  return lead ? NextResponse.json({ ok: true, lead }) : NextResponse.json({ error: "Not found." }, { status: 404 });
}
