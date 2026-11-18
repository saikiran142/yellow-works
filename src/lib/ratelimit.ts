/**
 * Minimal in-memory sliding-window limiter + daily counter.
 * Good for local dev and a single instance. On Vercel (many instances) swap the store for
 * Upstash Redis or a Postgres table behind the same functions.
 */
const hits = new Map<string, number[]>();
const daily = new Map<string, number>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  return true;
}

/** Counts a unit against today's cap (UTC day). Returns false once the cap is reached. */
export function underDailyCap(bucket: string, cap: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${bucket}:${day}`;
  const used = daily.get(key) ?? 0;
  if (used >= cap) return false;
  daily.set(key, used + 1);
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
