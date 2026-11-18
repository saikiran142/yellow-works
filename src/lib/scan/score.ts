/**
 * Growth Scan scoring. Pure, deterministic and explainable: every point and every rupee shown
 * to the visitor comes from these rules and their own numbers. No outside statistics are used.
 */
import { z } from "zod";

import { SERVICES, type Service } from "@/content/services";
import { HEADACHES, type Headache } from "@/lib/leads/options";

export const SOURCES = ["google", "instagram", "facebook", "whatsapp", "walk-ins", "referrals", "paid-ads", "website"] as const;
export const SPEEDS = ["under-5-min", "within-1-hour", "same-day", "next-day-or-later"] as const;
export const TOOLS = ["none", "spreadsheet", "crm", "whatsapp-business", "booking-software", "chatbot"] as const;
export type Speed = (typeof SPEEDS)[number];

export const scanAnswers = z.object({
  sources: z.array(z.enum(SOURCES)).min(1).max(SOURCES.length),
  speed: z.enum(SPEEDS),
  tools: z.array(z.enum(TOOLS)).min(1).max(TOOLS.length),
  headache: z.enum(HEADACHES),
  monthlyEnquiries: z.number().int().min(0).max(5000),
  avgValue: z.number().int().min(0).max(1_000_000),
});
export type ScanAnswers = z.infer<typeof scanAnswers>;

/**
 * Planning assumption, NOT a measured statistic: the share of enquiries that go cold at each reply speed.
 * Shown to the visitor as editable so they can use their own experience.
 */
export const DEFAULT_LOSS_PCT: Record<Speed, number> = { "under-5-min": 5, "within-1-hour": 15, "same-day": 30, "next-day-or-later": 45 };

const SPEED_POINTS: Record<Speed, number> = { "under-5-min": 40, "within-1-hour": 28, "same-day": 14, "next-day-or-later": 4 };
const TOOL_POINTS: Record<(typeof TOOLS)[number], number> = { none: 0, spreadsheet: 3, "whatsapp-business": 5, crm: 10, "booking-software": 10, chatbot: 10 };

export interface ScoreBreakdown {
  total: number;
  parts: { label: string; points: number; max: number }[];
}

export function scoreScan(a: ScanAnswers): ScoreBreakdown {
  const speed = SPEED_POINTS[a.speed];
  const tools = Math.min(30, a.tools.reduce((s, t) => s + TOOL_POINTS[t], 0));
  const sources = Math.min(5, a.sources.length) * 3;
  const followUp = a.tools.some((t) => t === "crm" || t === "chatbot" || t === "booking-software") ? 15 : a.tools.some((t) => t === "whatsapp-business" || t === "spreadsheet") ? 7 : 0;
  const parts = [
    { label: "Reply speed", points: speed, max: 40 },
    { label: "Tools in use", points: tools, max: 30 },
    { label: "Follow-up system", points: followUp, max: 15 },
    { label: "Enquiry sources", points: sources, max: 15 },
  ];
  return { total: parts.reduce((s, p) => s + p.points, 0), parts };
}

export interface ValueAtRisk {
  monthly: number;
  pct: number;
  formula: string;
}

/** at risk per month = monthly enquiries × assumed % lost × average customer value */
export function valueAtRisk(a: ScanAnswers, pctOverride?: number): ValueAtRisk {
  const pct = Math.max(0, Math.min(100, pctOverride ?? DEFAULT_LOSS_PCT[a.speed]));
  const monthly = Math.round((a.monthlyEnquiries * pct * a.avgValue) / 100);
  return { monthly, pct, formula: `${a.monthlyEnquiries} enquiries × ${pct}% × ₹${a.avgValue.toLocaleString("en-IN")} = ₹${monthly.toLocaleString("en-IN")} a month` };
}

export function recommendServices(a: ScanAnswers, count = 3): Service[] {
  const slow = a.speed === "same-day" || a.speed === "next-day-or-later";
  const noSystem = !a.tools.some((t) => t === "crm" || t === "chatbot" || t === "booking-software");
  const narrow = a.sources.length <= 2;
  const scored = SERVICES.filter((s) => s.group !== "on-request").map((s, order) => {
    let pts = 0;
    if (s.solves.includes(a.headache as Headache)) pts += 3;
    if (slow && s.tags.includes("speed")) pts += 2;
    if (noSystem && s.tags.includes("organise")) pts += 2;
    if (narrow && s.tags.includes("reach")) pts += 1;
    return { s, pts, order };
  });
  return scored.sort((x, y) => y.pts - x.pts || x.order - y.order).slice(0, count).map((x) => x.s);
}

export function scoreLabel(total: number): string {
  return total >= 75 ? "Strong base" : total >= 50 ? "Room to grow" : "Enquiries are leaking";
}
