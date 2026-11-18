import { z } from "zod";

/**
 * Packages. Amounts come from the brief and are UNCONFIRMED: every price renders in [brackets]
 * until `confirmed` is set to true. Included services are a draft grouping for the owner to confirm.
 */
const money = z.object({ amount: z.number().int().positive(), confirmed: z.boolean() });

const schema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  setup: money,
  monthly: money.nullable(),
  plusAdSpend: z.boolean(),
  /** Package whose services are all included in this one. */
  includes: z.string().nullable(),
  services: z.array(z.string()),
  bestFor: z.string(),
  featured: z.boolean().optional(),
});
export type Pkg = z.infer<typeof schema>;

const raw: Pkg[] = [
  { id: "launch", name: "Launch", tagline: "Be found and look the part.", setup: { amount: 25000, confirmed: false }, monthly: null, plusAdSpend: false, includes: null, services: ["websites", "local-search", "ai-search"], bestFor: "Businesses with no site, or a site that does not bring enquiries." },
  { id: "front-desk", name: "Front Desk", tagline: "Answer every enquiry in under a minute.", setup: { amount: 35000, confirmed: false }, monthly: { amount: 9000, confirmed: false }, plusAdSpend: false, includes: "launch", services: ["whatsapp-assistant", "website-assistant", "lead-follow-up", "booking", "reviews"], bestFor: "Busy teams losing enquiries to slow replies.", featured: true },
  { id: "growth", name: "Growth", tagline: "Bring more in, and run it on autopilot.", setup: { amount: 45000, confirmed: false }, monthly: { amount: 20000, confirmed: false }, plusAdSpend: true, includes: "front-desk", services: ["ads", "content", "automation", "crm", "weekly-report"], bestFor: "Businesses ready to grow with ads and a full system." },
];

export const PACKAGES: Pkg[] = raw.map((p) => schema.parse(p));

/** "₹25,000" when confirmed, "₹[25,000]" while it is still a placeholder. */
export function price(m: { amount: number; confirmed: boolean }): string {
  const n = m.amount.toLocaleString("en-IN");
  return m.confirmed ? `₹${n}` : `₹[${n}]`;
}

export const PRICING_NOTE = "Platform, messaging and ad charges (for example WhatsApp, Google and Meta) are paid by you directly to those providers. Our fees are separate.";
