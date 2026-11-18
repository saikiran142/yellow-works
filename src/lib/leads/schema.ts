import { z } from "zod";

import { scanAnswers } from "@/lib/scan/score";

import { CHANNELS, HEADACHES, INDUSTRIES, TIMES } from "./options";

/** Accepts 10-digit Indian mobiles with optional +91 / 91 / 0 prefix. Returns "+91XXXXXXXXXX" or null. */
export function normaliseIndianMobile(input: string): string | null {
  const d = input.replace(/\D/g, "");
  const t = d.length === 12 && d.startsWith("91") ? d.slice(2) : d.length === 11 && d.startsWith("0") ? d.slice(1) : d;
  return /^[6-9]\d{9}$/.test(t) ? `+91${t}` : null;
}

/** Hides all but the last 4 characters, for any log or UI that does not need the full number. */
export function maskPhone(p: string): string {
  return p.length > 4 ? `${"•".repeat(Math.max(0, p.length - 4))}${p.slice(-4)}` : p;
}

const text = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max, `Please keep this under ${max} characters.`);

const attribution = z
  .object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
    referrer: z.string().max(200).optional(),
    landing: z.string().max(200).optional(),
  })
  .optional();
export type Attribution = NonNullable<z.infer<typeof attribution>>;

const phone = z.string().trim().refine((v) => normaliseIndianMobile(v) !== null, "Enter a 10-digit Indian mobile number.");

const base = {
  idempotencyKey: z.string().min(8).max(64),
  /** Honeypot: real visitors never see or fill this. */
  company_website: z.string().max(200).optional(),
  /** Milliseconds from form mount to submit. Bots submit instantly. */
  elapsedMs: z.number().int().min(0).max(86_400_000).optional(),
  consent: z.literal(true, { error: "Please tick the box so we can contact you." }),
  attribution,
};

export const demoLeadSchema = z.object({
  kind: z.literal("demo"),
  ...base,
  name: text(2, 80, "Enter your name."),
  business: text(2, 80, "Enter your business name."),
  industry: z.enum(INDUSTRIES, { error: "Choose an industry." }),
  channel: z.enum(CHANNELS, { error: "Choose where most enquiries come from." }),
  headache: z.enum(HEADACHES, { error: "Choose your biggest headache." }),
  headacheNote: z.string().trim().max(300).optional(),
  whatsapp: phone,
  preferredTime: z.enum(TIMES, { error: "Choose a time." }),
});
export type DemoLeadInput = z.infer<typeof demoLeadSchema>;

export const scanLeadSchema = z
  .object({
    kind: z.literal("scan"),
    ...base,
    name: text(2, 80, "Enter your name."),
    whatsapp: phone.optional().or(z.literal("")),
    email: z.string().trim().max(120).email("Enter a valid email.").optional().or(z.literal("")),
    answers: scanAnswers,
    assumedLossPct: z.number().min(0).max(100).optional(),
    delivery: z.enum(["whatsapp", "email"]),
  })
  .superRefine((v, ctx) => {
    if (v.delivery === "whatsapp" && !v.whatsapp) ctx.addIssue({ code: "custom", path: ["whatsapp"], message: "Enter your WhatsApp number." });
    if (v.delivery === "email" && !v.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Enter your email." });
  });
export type ScanLeadInput = z.infer<typeof scanLeadSchema>;
