import type { NewLead } from "@/lib/db/types";
import { recommendServices, scoreScan, valueAtRisk } from "@/lib/scan/score";

import { normaliseIndianMobile, type DemoLeadInput, type ScanLeadInput } from "./schema";

function attributionFields(a: DemoLeadInput["attribution"]): Pick<NewLead, "attribution" | "source" | "campaign"> {
  return {
    attribution: a ? JSON.stringify(a) : null,
    source: a?.source ?? (a?.referrer ? `referral:${a.referrer}` : "direct"),
    campaign: a?.campaign ?? null,
  };
}

export function demoToNewLead(i: DemoLeadInput): NewLead {
  return {
    idempotencyKey: i.idempotencyKey,
    kind: "demo",
    name: i.name,
    business: i.business,
    industry: i.industry,
    channel: i.channel,
    headache: i.headache,
    headacheNote: i.headacheNote || null,
    whatsapp: normaliseIndianMobile(i.whatsapp),
    email: null,
    preferredTime: i.preferredTime,
    consent: true,
    scan: null,
    score: null,
    ...attributionFields(i.attribution),
  };
}

/** The score and value at risk are recomputed on the server; client-supplied results are never trusted. */
export function scanToNewLead(i: ScanLeadInput): NewLead {
  const score = scoreScan(i.answers).total;
  const risk = valueAtRisk(i.answers, i.assumedLossPct);
  return {
    idempotencyKey: i.idempotencyKey,
    kind: "scan",
    name: i.name,
    business: null,
    industry: null,
    channel: null,
    headache: i.answers.headache,
    headacheNote: null,
    whatsapp: i.whatsapp ? normaliseIndianMobile(i.whatsapp) : null,
    email: i.email || null,
    preferredTime: null,
    consent: true,
    scan: JSON.stringify({ answers: i.answers, valueAtRiskMonthly: risk.monthly, assumedLossPct: risk.pct, delivery: i.delivery, services: recommendServices(i.answers).map((s) => s.id) }),
    score,
    ...attributionFields(i.attribution),
  };
}
