/** Single shared rupee formatter (Indian digit grouping). */
export function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Digits only, capped, for numeric text inputs. Returns 0 for empty input. */
export function digitsToInt(s: string, max: number): number {
  const n = Number(s.replace(/\D/g, "").slice(0, 9));
  return Math.min(Number.isFinite(n) ? n : 0, max);
}
