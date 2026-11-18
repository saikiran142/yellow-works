export type EventName = "hero_personalised" | "demo_started" | "demo_completed" | "industry_switched" | "scan_completed" | "demo_booked" | "whatsapp_clicked";

/** Fire-and-forget funnel event. Carries source attribution from the URL (utm_source), never free text. */
export function track(name: EventName, props?: Record<string, string | number | boolean>): void {
  try {
    const source = new URLSearchParams(window.location.search).get("utm_source") ?? document.referrer.split("/")[2] ?? "direct";
    const payload = JSON.stringify({ name, source: source.slice(0, 60), props });
    if (!navigator.sendBeacon?.("/api/analytics", new Blob([payload], { type: "application/json" }))) {
      void fetch("/api/analytics", { method: "POST", body: payload, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* analytics must never break the page */
  }
}
