/**
 * Scripted Front Desk engine. Pure and isomorphic: used by the API route today and by the client
 * as the "never appears broken" fallback. Mirrors the guardrails the live model will follow:
 * answer only from business knowledge, no medical/legal/financial advice, hand over emergencies
 * and complaints, decline unrelated questions, say when unsure, identify as automated.
 */
import { DEMO_BUSINESSES, getDemoBusiness, type DemoBusiness } from "@/content/demo-businesses";

import { DAY_SHORT, DAY_WORDS, KEYWORDS, STRINGS } from "./i18n";
import type { BusinessType, ChatMessage, ChatResult, DayKey, Lang } from "./types";
import { DAYS } from "./types";

export interface ScriptedContext {
  businessType: BusinessType;
  businessName?: string;
  lang: Lang;
  messages: ChatMessage[];
}

export function resolveBusiness(type: BusinessType, nameOverride?: string): DemoBusiness {
  const base = getDemoBusiness(type);
  const name = nameOverride?.trim();
  return name ? { ...base, name } : base;
}

export function greeting(business: DemoBusiness, lang: Lang): string {
  return STRINGS[lang].greet(business.name);
}

export function hoursText(b: DemoBusiness, lang: Lang): string {
  const d = DAY_SHORT[lang];
  const days = b.hours.from === b.hours.to ? d[b.hours.from] : `${d[b.hours.from]}–${d[b.hours.to]}`;
  return `${days}, ${b.hours.open}–${b.hours.close}`;
}

export function slotLabel(day: DayKey, time: string, lang: Lang): string {
  return `${DAY_SHORT[lang][day]} ${time}`;
}

function dayFrom(text: string): DayKey | null {
  const t = text.toLowerCase();
  for (const d of DAYS) if (DAY_WORDS[d].some((w) => new RegExp(`(^|[^a-z])${w}`, "i").test(t))) return d;
  return null;
}

/** Normalises "5pm", "5 pm", "17:00" and bare "5" into "5:00 pm" style. Returns null when no time is present. */
function timeFrom(text: string): string | null {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ?? "00";
  let ap = m[3]?.toLowerCase();
  if (h > 23 || Number(min) > 59) return null;
  if (!ap) {
    if (h >= 13) ap = "pm";
    else ap = h >= 1 && h <= 8 ? "pm" : "am";
  }
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ap}`;
}

function matchSlots(b: DemoBusiness, text: string): DemoBusiness["slots"] | null {
  const day = dayFrom(text);
  const time = timeFrom(text);
  if (!day && !time) return null;
  return b.slots.filter((s) => (!day || s.day === day) && (!time || s.time === time));
}

function allSlotLabels(b: DemoBusiness, lang: Lang): string[] {
  return b.slots.map((s) => slotLabel(s.day, s.time, lang));
}

function pickName(text: string): string | null {
  if (/[?\d]/.test(text)) return null;
  const cleaned = text
    .replace(/^(my name is|i am|i'm|this is|name:?|నా పేరు|मेरा नाम)\s+/i, "")
    .replace(/[.!,]+$/g, "")
    .trim();
  const words = cleaned.split(/\s+/);
  if (!cleaned || words.length > 3 || cleaned.length > 30) return null;
  return cleaned;
}

function anyKeyword(text: string): boolean {
  return Object.values(KEYWORDS).some((re) => re.test(text));
}

export function scriptedReply(ctx: ScriptedContext): ChatResult {
  const { lang } = ctx;
  const b = resolveBusiness(ctx.businessType, ctx.businessName);
  const s = STRINGS[lang];
  const lastUser = [...ctx.messages].reverse().find((m) => m.role === "user")?.text.trim() ?? "";
  const lastBot = [...ctx.messages].reverse().find((m) => m.role === "assistant");
  const prevIntent = lastBot?.intent;
  const slots = allSlotLabels(b, lang);

  const book = (slot: DemoBusiness["slots"][number]): ChatResult => {
    const label = slotLabel(slot.day, slot.time, lang);
    return {
      reply: s.booked(label),
      intent: "booked",
      appointment: { day: slot.day, time: slot.time, label },
      lead: { interest: `Booking · ${label}` },
    };
  };

  // 1. Safety first: emergencies and complaints always hand over.
  if (KEYWORDS.urgent.test(lastUser)) return { reply: s.urgent, intent: "handover_urgent", handover: { reason: "urgent" }, lead: { interest: "Urgent" } };
  if (KEYWORDS.complaint.test(lastUser)) return { reply: s.complaint, intent: "handover_complaint", handover: { reason: "complaint" }, lead: { interest: "Complaint" } };
  if (KEYWORDS.advice.test(lastUser)) return { reply: s.advice, intent: "declined_advice", lead: { interest: "Advice request (declined)" }, suggestions: [s.ui.chips.book] };
  if (KEYWORDS.offtopic.test(lastUser)) return { reply: s.offtopic(b.name), intent: "declined_offtopic", suggestions: [s.ui.chips.price, s.ui.chips.hours] };

  // 2. Name capture right after a booking.
  if (prevIntent === "booked" && !anyKeyword(lastUser)) {
    const name = pickName(lastUser);
    if (name) {
      const booked = [...ctx.messages].reverse().find((m) => m.intent === "booked")?.text ?? "";
      const label = booked.match(/[:：]\s*(.+?)[.।]/)?.[1] ?? "";
      return { reply: s.thanks(name, label), intent: "lead_captured", lead: { name, interest: "Booking" } };
    }
  }

  // 3. Slot selection (after we asked, or when the message names a day/time with booking words).
  const awaitingSlot = prevIntent === "booking_ask" || prevIntent === "slot_unavailable";
  if (awaitingSlot || KEYWORDS.booking.test(lastUser)) {
    const found = matchSlots(b, lastUser);
    if (found && found.length === 1) return book(found[0] as DemoBusiness["slots"][number]);
    if (found && found.length > 1) {
      return { reply: s.askSlot, intent: "booking_ask", suggestions: found.map((x) => slotLabel(x.day, x.time, lang)), lead: { interest: "Booking" } };
    }
    if (found && found.length === 0 && (awaitingSlot || dayFrom(lastUser) || timeFrom(lastUser))) {
      if (awaitingSlot || /\b(am|pm)\b|:\d{2}/i.test(lastUser) || dayFrom(lastUser)) {
        return { reply: s.slotUnavailable, intent: "slot_unavailable", suggestions: slots };
      }
    }
  }

  // 4. Business knowledge answers.
  if (KEYWORDS.price.test(lastUser)) {
    const list = b.services.map((x) => `${x.name} ${x.price}`).join(", ");
    return { reply: s.price(list), intent: "price", lead: { interest: "Price enquiry" }, suggestions: [s.ui.chips.book, s.ui.chips.hours] };
  }
  if (KEYWORDS.hours.test(lastUser)) return { reply: s.hours(b.name, hoursText(b, lang)), intent: "hours", lead: { interest: "Timings" }, suggestions: [s.ui.chips.book, s.ui.chips.price] };
  if (KEYWORDS.location.test(lastUser)) return { reply: s.location(b.name, b.area), intent: "location", lead: { interest: "Location" }, suggestions: [s.ui.chips.book] };
  if (KEYWORDS.booking.test(lastUser) && !KEYWORDS.unsure.test(lastUser)) {
    return { reply: s.askSlot, intent: "booking_ask", suggestions: slots, lead: { interest: "Booking" } };
  }

  // 5. Say when unsure, and hand over.
  return { reply: s.unsure, intent: "unsure", handover: { reason: "unsure" }, lead: { interest: "Question for staff" } };
}

export function defaultChips(b: DemoBusiness, lang: Lang): string[] {
  const c = STRINGS[lang].ui.chips;
  return [c.price, c.hours, c.book, c.location];
}

export { DEMO_BUSINESSES };
