import type { Attribution } from "@/lib/leads/schema";

const KEY = "tyw-attr";

/** First-touch source capture. Kept in sessionStorage (this tab only), never in a cookie. */
export function captureAttribution(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const hasUtm = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].some((k) => q.has(k));
    if (!hasUtm && sessionStorage.getItem(KEY)) return;
    const ref = document.referrer ? new URL(document.referrer).hostname : undefined;
    const a: Attribution = {
      source: q.get("utm_source") ?? undefined,
      medium: q.get("utm_medium") ?? undefined,
      campaign: q.get("utm_campaign") ?? undefined,
      term: q.get("utm_term") ?? undefined,
      content: q.get("utm_content") ?? undefined,
      referrer: ref && ref !== window.location.hostname ? ref : undefined,
      landing: window.location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage or URL parsing unavailable; attribution is best-effort */
  }
}

export function getAttribution(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}

export function newKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export interface SubmitResult {
  ok: boolean;
  fields?: Record<string, string>;
  error?: string;
}

/** Posts a lead. The same idempotencyKey is reused on retry so a double-tap never creates two leads. */
export async function postLead(payload: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, attribution: getAttribution() }) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
    if (res.ok) return { ok: true };
    return { ok: false, error: data.error ?? "Something went wrong. Please try again.", fields: data.fields };
  } catch {
    return { ok: false, error: "We could not reach the server. Check your connection and try again." };
  }
}
