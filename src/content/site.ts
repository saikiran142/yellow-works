import { z } from "zod";

/**
 * Site-wide facts. Anything unconfirmed is shown in [square brackets] so it cannot be mistaken
 * for a real value. Set `confirmed: true` once the owner has signed it off.
 */
export interface Fact {
  value: string;
  confirmed: boolean;
}

export const fact = (value: string, confirmed = false): Fact => ({ value, confirmed });
export const show = (f: Fact): string => (f.confirmed ? f.value : `[${f.value}]`);

const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export const SITE = {
  name: "The Yellow Works",
  legalEntity: fact("legal entity name"),
  address: fact("registered address, Hyderabad"),
  email: email ? fact(email, true) : fact("email"),
  whatsapp: wa ? fact(wa, true) : fact("number"),
  registration: fact("registration details, e.g. CIN / GSTIN"),
  governingLaw: fact("Telangana, India"),
  foundingSlots: fact("5"),
  foundingTerms: fact("terms to confirm: what founding clients get and for how long"),
  initialTerm: fact("initial term length"),
} as const;

export function whatsappHref(message = "Hi, I'd like a personalised demo."): string {
  const n = (wa ?? "number").replace(/\D/g, "") || "number";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

const stepSchema = z.object({ title: z.string(), body: z.string() });
export const PROCESS = z.array(stepSchema).parse([
  { title: "Free growth scan", body: "Two minutes. We see where enquiries are slipping away and what it may be costing you." },
  { title: "Personalised demo", body: "We show the assistant answering as your business, using your services and prices." },
  { title: "Set-up in about 10 working days", body: "We build and connect everything in your own accounts. You review it before it goes live." },
  { title: "Go live, staff trained", body: "Your team learns the handover and the dashboard. The assistant says it is automated and passes people to your staff." },
  { title: "Monthly report", body: "A plain report of enquiries, replies and bookings, and what we will improve next." },
]);

export const TRUST = [
  { title: "Founder-led", body: "You deal with the people who build your system, not an account manager." },
  { title: "Your accounts, your data", body: "Domains, ad accounts, WhatsApp and CRM stay in your name. If we part, you keep everything." },
  { title: "Data-protection terms in every contract", body: "Plain terms on what we collect, why, and how long we keep it." },
  { title: "Assistants say they are automated", body: "They hand over to a person for emergencies, complaints and anything they are unsure about." },
  { title: "Month-to-month after the initial term", body: "No long lock-in once the initial set-up period ends." },
] as const;
