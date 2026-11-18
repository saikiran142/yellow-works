import { BUSINESS_TYPES, type BusinessType } from "@/lib/demo/types";

export const INDUSTRIES = BUSINESS_TYPES;
export const INDUSTRY_LABEL: Record<BusinessType, string> = {
  clinic: "Clinic",
  "real-estate": "Real estate",
  education: "Education centre",
  "salon-fitness": "Salon or fitness",
  restaurant: "Restaurant",
  store: "Store",
  services: "Professional or local service",
};

export const CHANNELS = ["whatsapp", "instagram", "phone", "website", "walk-in", "other"] as const;
export type Channel = (typeof CHANNELS)[number];
export const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram or Facebook",
  phone: "Phone calls",
  website: "Website or Google",
  "walk-in": "Walk-ins",
  other: "Something else",
};

export const HEADACHES = ["slow-replies", "few-enquiries", "no-shows", "no-follow-up", "few-reviews", "staff-time"] as const;
export type Headache = (typeof HEADACHES)[number];
export const HEADACHE_LABEL: Record<Headache, string> = {
  "slow-replies": "We reply too slowly",
  "few-enquiries": "Not enough enquiries",
  "no-shows": "Customers don't turn up",
  "no-follow-up": "Nobody follows up",
  "few-reviews": "Too few good reviews",
  "staff-time": "Staff spend too long on routine work",
};

export const TIMES = ["morning", "afternoon", "evening", "any"] as const;
export type PreferredTime = (typeof TIMES)[number];
export const TIME_LABEL: Record<PreferredTime, string> = {
  morning: "Morning (10 am to 1 pm)",
  afternoon: "Afternoon (2 pm to 5 pm)",
  evening: "Evening (6 pm to 8 pm)",
  any: "Any time works",
};

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
