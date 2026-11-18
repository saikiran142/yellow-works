/**
 * Lead Autopilot scripted engine. Pure and isomorphic (API route + browser fallback).
 * Everything here is an illustration: nothing is sent, stored or logged. The model-drafted
 * version will replace `draft*` only; scoring and timing stay rule-based and explainable.
 */
import { z } from "zod";

import { resolveBusiness } from "@/lib/demo/scripted";
import { BUSINESS_TYPES, DAYS, type BusinessType } from "@/lib/demo/types";
import { DAY_SHORT } from "@/lib/demo/i18n";

export const MAX_ENQUIRY_CHARS = 300;

export const autopilotRequest = z.object({
  text: z.string().trim().min(2, "Type a sample enquiry first.").max(MAX_ENQUIRY_CHARS),
  businessType: z.enum(BUSINESS_TYPES),
  businessName: z.string().trim().max(60).optional(),
  source: z.enum(["form", "ad"]),
  sessionId: z.string().min(8).max(64),
});
export type AutopilotRequest = z.infer<typeof autopilotRequest>;

export type StepId = "captured" | "enriched" | "crm" | "reply" | "alert" | "followups" | "report" | "noticed" | "replied" | "logged";

export interface RunStep {
  id: StepId;
  title: string;
  /** Label shown on the node (simulated clock). */
  at: string;
  /** When this step completes during playback, in real milliseconds. */
  playAt: number;
  detail: string;
  status: "done" | "missed";
}

export interface Run {
  steps: RunStep[];
  /** Real ms until the first reply step in autopilot; null in the manual illustration. */
  firstReplyMs: number | null;
  firstReplyLabel: string;
}

export interface AutopilotResult {
  score: number;
  tier: "Hot" | "Warm" | "Cool";
  factors: string[];
  enrichment: { intent: string; service: string | null; urgency: "high" | "normal"; language: string; source: string };
  auto: Run;
  manual: Run;
  previews: {
    whatsapp: string;
    email: { subject: string; body: string };
    staff: string;
    followups: { day: string; channel: string; text: string }[];
    report: { label: string; value: string }[];
    lateWhatsapp: string;
  };
}

export const AD_LEADS: Record<BusinessType, string> = {
  clinic: "Hi, saw your ad. How much is teeth cleaning? Any slot this Saturday?",
  "real-estate": "Interested in a 2BHK, budget around 60 lakh. Can I visit this weekend?",
  education: "Saw your ad. What is the fee for the monthly batch? Can my son try a demo class?",
  "salon-fitness": "Hi, how much is a facial? Is a slot free tomorrow evening?",
  restaurant: "Need a table for 6 on Saturday night. Is it available? Urgent.",
  store: "Saw your offer on screen guards. Price for my phone? I can come today.",
  services: "AC not cooling. How much for service and can someone come today?",
};

function detectLanguage(t: string): string {
  if (/[ఀ-౿]/.test(t)) return "Telugu";
  if (/[ऀ-ॿ]/.test(t)) return "Hindi";
  return "English";
}

export function scoreEnquiry(text: string): { score: number; tier: AutopilotResult["tier"]; factors: string[] } {
  const t = text.toLowerCase();
  let score = 40;
  const factors = ["Starts at 40"];
  const add = (cond: boolean, pts: number, why: string): void => {
    if (cond) {
      score += pts;
      factors.push(`${pts > 0 ? "+" : ""}${pts} ${why}`);
    }
  };
  add(/book|appointment|slot|visit|reserve|table|demo class|trial|come/.test(t), 20, "asks to book or visit");
  add(/price|cost|fee|how much|quote|rate|budget|₹|lakh|\d+\s?k\b/.test(t), 15, "asks about price or states a budget");
  add(/urgent|asap|today|tonight|now|tomorrow|this (week|weekend)|saturday|sunday/.test(t), 10, "mentions a near date");
  add(/\d/.test(t), 5, "includes specific numbers");
  add(text.trim().length < 15, -15, "very short message");
  score = Math.max(5, Math.min(99, score));
  return { score, tier: score >= 75 ? "Hot" : score >= 55 ? "Warm" : "Cool", factors };
}

export function buildAutopilot(req: Omit<AutopilotRequest, "sessionId">): AutopilotResult {
  const b = resolveBusiness(req.businessType, req.businessName);
  const text = req.text.trim();
  const t = text.toLowerCase();
  const { score, tier, factors } = scoreEnquiry(text);
  const service = b.services.find((s) => s.name.toLowerCase().split(/\s+/).some((w) => w.length > 3 && t.includes(w)))?.name ?? null;
  const wantsPrice = /price|cost|fee|how much|quote|rate/.test(t);
  const wantsBooking = /book|appointment|slot|visit|reserve|table|demo class|trial|come/.test(t);
  const intent = wantsBooking ? "Booking" : wantsPrice ? "Price enquiry" : "General enquiry";
  const urgency = /urgent|asap|today|tonight|now/.test(t) ? "high" : "normal";
  const source = req.source === "ad" ? "Instagram ad (sample)" : "Website form (sample)";
  const language = detectLanguage(text);
  const matched = service ? b.services.find((s) => s.name === service) : undefined;
  const slots = b.slots.slice(0, 2).map((s) => `${DAY_SHORT.en[s.day]} ${s.time}`);

  const answer = matched ? `${matched.name} is ${matched.price}.` : `Here is what we offer: ${b.services.map((s) => `${s.name} ${s.price}`).join(", ")}.`;
  const whatsapp = `Hi! Thanks for contacting ${b.name}. ${answer} Would ${slots[0]} or ${slots[1]} suit you? Reply with your pick and I will book it.`;
  const staff = `${tier} lead (${score}/100). ${intent}${service ? ` · ${service}` : ""}${urgency === "high" ? " · wants it soon" : ""}. Customer already received a reply in 3.6 s. Suggested: call back within the hour.`;
  const email = {
    subject: `Your enquiry to ${b.name}`,
    body: `Hello,\n\nThanks for getting in touch with ${b.name}. ${answer}\n\nWe have these slots open: ${slots.join(", ")}. Reply to this email or on WhatsApp to confirm.\n\nTeam ${b.name}`,
  };
  const followups = [
    { day: "Day 1", channel: "WhatsApp", text: `Hi, just checking if you would like to book a slot at ${b.name}. Happy to help with any questions.` },
    { day: "Day 3", channel: "Email", text: `A short note from ${b.name}: ${service ?? "our services"} slots are filling this week. Want us to hold one for you?` },
    { day: "Day 7", channel: "WhatsApp", text: `Last note from ${b.name}. If now is not the right time, no problem. Message us whenever you are ready.` },
  ];
  const report = [
    { label: "New leads counted", value: "+1" },
    { label: "Source", value: source },
    { label: "First reply", value: "3.6 s" },
    { label: "Follow-ups queued", value: "3" },
  ];
  const lateWhatsapp = `Hi, sorry for the late reply. ${answer} Are you still interested?`;

  const snippet = text.length > 60 ? `${text.slice(0, 57)}…` : text;
  const auto: Run = {
    firstReplyMs: 3600,
    firstReplyLabel: "3.6 s",
    steps: [
      { id: "captured", title: "Captured", at: "+0.0 s", playAt: 0, detail: `From ${source}: “${snippet}”`, status: "done" },
      { id: "enriched", title: "Enriched and scored", at: "+1.2 s", playAt: 1200, detail: `Score ${score} (${tier}) · ${intent}${service ? ` · ${service}` : ""}`, status: "done" },
      { id: "crm", title: "Logged in CRM", at: "+2.3 s", playAt: 2300, detail: "Contact and enquiry saved. Stage: New", status: "done" },
      { id: "reply", title: "Instant reply", at: "+3.6 s", playAt: 3600, detail: "WhatsApp and email reply ready (preview only)", status: "done" },
      { id: "alert", title: "Staff alerted", at: "+3.9 s", playAt: 3900, detail: "Owner notified with the score and a suggested next step", status: "done" },
      { id: "followups", title: "Follow-ups scheduled", at: "+4.9 s", playAt: 4900, detail: "Day 1, Day 3 and Day 7 queued", status: "done" },
      { id: "report", title: "Weekly report updated", at: "+5.7 s", playAt: 5700, detail: "Lead added to this week's numbers", status: "done" },
    ],
  };
  const manual: Run = {
    firstReplyMs: null,
    firstReplyLabel: "about 13 hours",
    steps: [
      { id: "captured", title: "Enquiry arrives", at: "9:42 pm", playAt: 0, detail: "Nobody is online. The message waits in a chat thread.", status: "done" },
      { id: "noticed", title: "Noticed by staff", at: "10:15 am next day", playAt: 1400, detail: "Seen when the phone is next checked", status: "missed" },
      { id: "replied", title: "Replied by hand", at: "10:40 am next day", playAt: 2800, detail: "Typed on a phone between other jobs", status: "done" },
      { id: "logged", title: "Logged", at: "Not logged", playAt: 4200, detail: "Lives in the chat. No CRM entry, no score", status: "missed" },
      { id: "alert", title: "Owner alerted", at: "Not alerted", playAt: 5000, detail: "The owner finds out only if someone remembers to tell them", status: "missed" },
      { id: "followups", title: "Follow-ups", at: "None planned", playAt: 5800, detail: "Depends on someone remembering", status: "missed" },
      { id: "report", title: "Weekly report", at: "No data", playAt: 6600, detail: "Nothing recorded, so nothing to count", status: "missed" },
    ],
  };

  return {
    score,
    tier,
    factors,
    enrichment: { intent, service, urgency, language, source },
    auto,
    manual,
    previews: { whatsapp, email, staff, followups, report, lateWhatsapp },
  };
}

export { DAYS };
