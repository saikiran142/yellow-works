import "server-only";

import type { Lead } from "@/lib/db/types";
import { INDUSTRY_LABEL } from "@/lib/leads/options";
import type { BusinessType } from "@/lib/demo/types";

/**
 * Posts a short alert to LEAD_WEBHOOK_URL (Slack/Teams/Zapier style `{ text }`).
 * The destination is the owner's own channel. Failures never fail the visitor's request.
 */
export async function notifyLead(lead: Lead): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  const industry = lead.industry ? INDUSTRY_LABEL[lead.industry as BusinessType] ?? lead.industry : "n/a";
  const text =
    lead.kind === "demo"
      ? `New demo request: ${lead.name} (${lead.business}), ${industry}. WhatsApp ${lead.whatsapp}. Prefers ${lead.preferredTime}. Headache: ${lead.headache}. Source: ${lead.source}${lead.campaign ? ` / ${lead.campaign}` : ""}.`
      : `New growth scan: ${lead.name}. Score ${lead.score}/100. Wants the result by ${lead.whatsapp ? `WhatsApp ${lead.whatsapp}` : `email ${lead.email}`}. Source: ${lead.source}.`;
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, leadId: lead.id, kind: lead.kind }), signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
