/**
 * Provider-agnostic LLM module. Server-side only (never import from a client component).
 * Config: LLM_PROVIDER (default "anthropic"), LLM_API_KEY, LLM_MODEL.
 */
import "server-only";

export interface CompleteParams {
  system: string;
  user: string;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LlmProvider {
  complete(params: CompleteParams): Promise<string>;
}

export class LlmUnavailableError extends Error {}

const anthropic: LlmProvider = {
  async complete({ system, user, maxTokens = 400, timeoutMs = 5000 }) {
    const key = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL;
    if (!key || !model) throw new LlmUnavailableError("LLM_API_KEY / LLM_MODEL not set");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new LlmUnavailableError(`provider status ${res.status}`);
    const data: unknown = await res.json();
    const text = (data as { content?: { type: string; text?: string }[] }).content?.find((c) => c.type === "text")?.text;
    if (!text) throw new LlmUnavailableError("empty completion");
    return text;
  },
};

const providers: Record<string, LlmProvider> = { anthropic };

export function getLlm(): LlmProvider {
  const name = process.env.LLM_PROVIDER ?? "anthropic";
  const p = providers[name];
  if (!p) throw new LlmUnavailableError(`unknown provider ${name}`);
  return p;
}

/** Pulls the first JSON object out of a completion (tolerates code fences). */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new LlmUnavailableError("no JSON in completion");
  return JSON.parse(text.slice(start, end + 1));
}
