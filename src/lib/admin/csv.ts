import type { Lead } from "@/lib/db/types";

/** Neutralises spreadsheet formula injection (=, +, -, @, tab, CR) and quotes every cell. */
export function csvCell(v: string | number | boolean | null | undefined): string {
  let s = v === null || v === undefined ? "" : String(v);
  // A bare "+<digits>" (our normalised phone numbers) cannot be a formula, so it stays readable.
  if (/^[=+\-@\t\r]/.test(s) && !/^\+\d+$/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const COLUMNS: [string, (l: Lead) => string | number | boolean | null][] = [
  ["id", (l) => l.id],
  ["created_at", (l) => l.createdAt],
  ["kind", (l) => l.kind],
  ["status", (l) => l.status],
  ["name", (l) => l.name],
  ["business", (l) => l.business],
  ["industry", (l) => l.industry],
  ["channel", (l) => l.channel],
  ["headache", (l) => l.headache],
  ["whatsapp", (l) => l.whatsapp],
  ["email", (l) => l.email],
  ["preferred_time", (l) => l.preferredTime],
  ["score", (l) => l.score],
  ["source", (l) => l.source],
  ["campaign", (l) => l.campaign],
  ["notes", (l) => l.notes],
];

export function leadsToCsv(leads: Lead[]): string {
  const head = COLUMNS.map(([h]) => csvCell(h)).join(",");
  const rows = leads.map((l) => COLUMNS.map(([, f]) => csvCell(f(l))).join(","));
  return [head, ...rows].join("\r\n");
}
