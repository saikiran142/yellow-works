/**
 * Structured JSON logs. Rule: never pass names, phone numbers, emails, message text or other
 * personal data. IDs, counts, status codes and error messages only.
 */
type Level = "info" | "warn" | "error";

export function log(level: Level, msg: string, fields: Record<string, string | number | boolean | null | undefined> = {}): void {
  const line = JSON.stringify({ level, msg, at: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else console.log(line);
}
