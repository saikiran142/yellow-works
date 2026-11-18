import { NextResponse } from "next/server";

import { extractJson, getLlm } from "@/lib/llm";
import { buildPersonalisation, personaliseInput, personaliseResult, rulesPersonalise, sanitise } from "@/lib/personalise/rules";
import { clientIp, rateLimit, underDailyCap } from "@/lib/ratelimit";
import { PERSONALISE_V1_SYSTEM } from "@/prompts/personalise.v1";

export const runtime = "nodejs";

const DAILY_LLM_CAP = Number(process.env.PERSONALISE_DAILY_LLM_CAP ?? 500);

/**
 * Classifies the business and drafts three sample questions.
 * Nothing is stored or logged: the visitor's text is used for this request only.
 * Any LLM problem (no key, timeout, bad output, cap reached) falls back to rules.
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(`personalise:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = personaliseInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const text = sanitise(parsed.data.text);
  if (text.length < 2) return NextResponse.json({ error: "Tell us your business name and what you do." }, { status: 400 });

  if (process.env.LLM_API_KEY && underDailyCap("personalise-llm", DAILY_LLM_CAP)) {
    try {
      const raw = await getLlm().complete({ system: PERSONALISE_V1_SYSTEM, user: `Visitor text: """${text}"""`, maxTokens: 300, timeoutMs: 4500 });
      const result = personaliseResult.parse(extractJson(raw));
      const questions = result.questions as [string, string, string];
      return NextResponse.json(buildPersonalisation({ businessName: sanitise(result.businessName), type: result.type, questions }, "ai"));
    } catch {
      // fall through to rules; the visitor never sees an error for this
    }
  }

  return NextResponse.json(rulesPersonalise(text));
}
