import { z } from "zod";

import { BUSINESS_TYPES } from "@/lib/demo/types";

/**
 * Industry pages are generated from this list (one template). Adding an industry = adding an entry
 * here plus its demo business in demo-businesses.ts. No statistics or client claims are made.
 */
const schema = z.object({
  slug: z.enum(BUSINESS_TYPES),
  name: z.string(),
  plural: z.string(),
  headline: z.string(),
  intro: z.string(),
  problems: z.array(z.string()).length(3),
  /** Service ids in the order that matters most for this industry. */
  services: z.array(z.string()).min(4),
});
export type Industry = z.infer<typeof schema>;

const raw: Industry[] = [
  { slug: "clinic", name: "Clinics", plural: "clinics", headline: "Fewer missed calls. Fewer empty slots.", intro: "Patients enquire at night and between consultations. We make sure each one gets an answer, a booking and a reminder.", problems: ["Calls go unanswered while the doctor is with a patient", "Patients forget appointments and slots go empty", "The same fee and timing questions take up the front desk"], services: ["whatsapp-assistant", "booking", "lead-follow-up", "reviews", "local-search"] },
  { slug: "real-estate", name: "Real estate", plural: "real-estate teams", headline: "Every buyer enquiry answered while it is still warm.", intro: "Buyers message several agents at once and the first good reply often wins the visit. We make yours instant and keep following up.", problems: ["Enquiries from portals and ads are answered hours later", "Site visits are not confirmed or reminded", "Leads are lost in agents' personal phones"], services: ["lead-follow-up", "whatsapp-assistant", "crm", "ads", "booking"] },
  { slug: "education", name: "Education centres", plural: "education centres", headline: "More demo classes booked, fewer questions repeated.", intro: "Parents ask about fees, batches and timings all day. We answer instantly and book the demo class.", problems: ["Batch and fee questions repeat all day", "Admission enquiries arrive after office hours", "Follow-up after a demo class is inconsistent"], services: ["whatsapp-assistant", "booking", "lead-follow-up", "website-assistant", "content"] },
  { slug: "salon-fitness", name: "Salons and gyms", plural: "salons and gyms", headline: "Full slots, fewer no-shows, steady reviews.", intro: "Walk-ins are great, but bookings and renewals need a system. We fill slots and bring members back.", problems: ["Slots go empty because customers forget", "Package and membership questions fill the inbox", "Few customers leave a review"], services: ["booking", "whatsapp-assistant", "reviews", "lead-follow-up", "content"] },
  { slug: "restaurant", name: "Restaurants", plural: "restaurants", headline: "Tables booked and parties confirmed without the phone ringing.", intro: "Reservation and party enquiries arrive at the busiest times. We handle them so your staff can serve.", problems: ["Reservation calls come during the rush", "Party and bulk orders need quick quotes", "Reviews pile up without replies"], services: ["whatsapp-assistant", "booking", "reviews", "local-search", "content"] },
  { slug: "store", name: "Stores", plural: "stores", headline: "Answer stock and price questions before the customer walks to another shop.", intro: "Shoppers ask about price, stock and timings before they visit. A fast answer decides where they go.", problems: ["Stock and price questions come all day", "Repeat customers are never reminded", "Online searches do not show your shop correctly"], services: ["whatsapp-assistant", "local-search", "lead-follow-up", "reviews", "websites"] },
  { slug: "services", name: "Professional firms and local services", plural: "professional firms and local services", headline: "Quotes sent fast, jobs booked, nothing forgotten.", intro: "Whether it is an AC technician or an accountant, the first firm to reply with a clear next step usually gets the job.", problems: ["Quote requests wait until the end of the day", "Jobs are scheduled over calls and chats", "Past customers are never followed up"], services: ["lead-follow-up", "whatsapp-assistant", "booking", "crm", "local-search"] },
];

export const INDUSTRIES: Industry[] = raw.map((i) => schema.parse(i));
export const getIndustry = (slug: string): Industry | undefined => INDUSTRIES.find((i) => i.slug === slug);
