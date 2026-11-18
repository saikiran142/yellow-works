import { z } from "zod";

export const LANGS = ["en", "te", "hi"] as const;
export type Lang = (typeof LANGS)[number];

export const BUSINESS_TYPES = ["clinic", "real-estate", "education", "salon-fitness", "restaurant", "store", "services"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAYS)[number];

export const INTENTS = [
  "greeting",
  "hours",
  "price",
  "location",
  "booking_ask",
  "booked",
  "lead_captured",
  "handover_urgent",
  "handover_complaint",
  "declined_advice",
  "declined_offtopic",
  "unsure",
  "slot_unavailable",
] as const;
export type Intent = (typeof INTENTS)[number];

export const MAX_INPUT_CHARS = 300;
export const MAX_USER_MESSAGES = 12;

export const chatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(MAX_INPUT_CHARS * 3),
  intent: z.enum(INTENTS).optional(),
});
export type ChatMessage = z.infer<typeof chatMessage>;

export const chatRequest = z.object({
  businessType: z.enum(BUSINESS_TYPES),
  businessName: z.string().trim().max(60).optional(),
  lang: z.enum(LANGS),
  sessionId: z.string().min(8).max(64),
  messages: z.array(chatMessage).min(1).max(MAX_USER_MESSAGES * 2 + 2),
});
export type ChatRequest = z.infer<typeof chatRequest>;

/** Structured output: the dashboard renders from this, never from free text. */
export const chatResult = z.object({
  reply: z.string(),
  intent: z.enum(INTENTS),
  lead: z.object({ name: z.string().optional(), interest: z.string() }).optional(),
  appointment: z.object({ day: z.enum(DAYS), time: z.string(), label: z.string() }).optional(),
  handover: z.object({ reason: z.enum(["urgent", "complaint", "unsure"]) }).optional(),
  suggestions: z.array(z.string()).optional(),
});
export type ChatResult = z.infer<typeof chatResult>;
