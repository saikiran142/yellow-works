import { autopilotRequest, buildAutopilot } from "@/lib/autopilot/engine";
import { clientIp, rateLimit, underDailyCap } from "@/lib/ratelimit";

export const runtime = "nodejs";

const DAILY_CAP = Number(process.env.DEMO_DAILY_CAP ?? 3000);

/**
 * Returns the full simulated run (both the autopilot and the manual illustration) as JSON.
 * The browser plays it back step by step. Nothing is sent, stored or logged.
 * Scripted today; a model-drafted reply plugs in later behind the same response shape.
 */
export async function POST(req: Request): Promise<Response> {
  const parsed = autopilotRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  const { sessionId, ...input } = parsed.data;

  if (!rateLimit(`autopilot:ip:${clientIp(req)}`, 10, 60_000)) return Response.json({ error: "Too many runs. Please wait a minute." }, { status: 429 });
  if (!rateLimit(`autopilot:session:${sessionId}`, 8, 600_000)) return Response.json({ error: "Run limit reached for this demo." }, { status: 429 });
  if (!underDailyCap("demo-autopilot", DAILY_CAP)) return Response.json({ error: "The demo is resting for today." }, { status: 503 });

  return Response.json(buildAutopilot(input), { headers: { "cache-control": "no-store" } });
}
