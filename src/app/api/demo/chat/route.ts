import { clientIp, rateLimit, underDailyCap } from "@/lib/ratelimit";
import { resolveBusiness, scriptedReply } from "@/lib/demo/scripted";
import { chatRequest, MAX_INPUT_CHARS, MAX_USER_MESSAGES, type ChatResult } from "@/lib/demo/types";

export const runtime = "nodejs";

const DAILY_CAP = Number(process.env.DEMO_DAILY_CAP ?? 3000);
const enc = new TextEncoder();
const line = (o: unknown): Uint8Array => enc.encode(`${JSON.stringify(o)}\n`);
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function bad(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

/**
 * Streams a Front Desk reply as NDJSON: {t:"delta",text} chunks, then {t:"final",result}.
 * Engine today: scripted (no key needed). The live-LLM engine plugs in at `produce()` later with
 * the same stream shape, so the client does not change. Nothing typed here is stored or logged.
 */
export async function POST(req: Request): Promise<Response> {
  const parsed = chatRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(400, "Invalid request.");
  const body = parsed.data;

  const ip = clientIp(req);
  if (!rateLimit(`chat:ip:${ip}`, 20, 60_000)) return bad(429, "Too many messages. Please wait a minute.");
  if (!rateLimit(`chat:session:${body.sessionId}`, 30, 600_000)) return bad(429, "Session limit reached.");
  if (!underDailyCap("demo-chat", DAILY_CAP)) return bad(503, "The demo is resting for today.");

  const users = body.messages.filter((m) => m.role === "user");
  if (users.length > MAX_USER_MESSAGES) return bad(429, "Message limit reached for this demo.");
  if (body.messages.at(-1)?.role !== "user") return bad(400, "Last message must be from the visitor.");
  if (users.some((m) => m.text.length > MAX_INPUT_CHARS)) return bad(400, `Messages are limited to ${MAX_INPUT_CHARS} characters.`);

  const business = resolveBusiness(body.businessType, body.businessName);
  const result: ChatResult = scriptedReply({ businessType: business.type, businessName: body.businessName, lang: body.lang, messages: body.messages });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await sleep(350); // think time, so the typing indicator is honest
        const words = result.reply.split(/(?<=\s)/u);
        for (const w of words) {
          controller.enqueue(line({ t: "delta", text: w }));
          await sleep(28);
        }
        controller.enqueue(line({ t: "final", result }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
