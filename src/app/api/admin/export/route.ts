import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin/auth";
import { leadsToCsv } from "@/lib/admin/csv";
import { getLeadStore } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  const csv = leadsToCsv(await getLeadStore().list({ limit: 2000 }));
  return new Response(`﻿${csv}`, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`, "cache-control": "no-store" },
  });
}
