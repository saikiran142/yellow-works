import { z } from "zod";

export const BUSINESS_TYPES = ["clinic", "real-estate", "education", "salon-fitness", "restaurant", "store", "services"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const personaliseInput = z.object({
  text: z.string().trim().min(2, "Tell us your business name and what you do.").max(120, "Please keep it under 120 characters."),
});

export const personaliseResult = z.object({
  businessName: z.string().trim().min(1).max(60),
  type: z.enum(BUSINESS_TYPES),
  questions: z.array(z.string().trim().min(3).max(90)).length(3),
});

export interface Personalisation {
  businessName: string;
  type: BusinessType;
  questions: [string, string, string];
  greeting: string;
  source: "ai" | "rules";
}

const KEYWORDS: Record<BusinessType, RegExp> = {
  clinic: /clinic|dent|doctor|hospital|physio|derma|eye|care|medical|health|diagnos|pharma|ortho|pediatric|vet/i,
  "real-estate": /real ?estate|property|properties|realt|builder|plots?|villa|apartment|housing|broker|developer/i,
  education: /school|tuition|coaching|academy|institute|classes|college|training|education|learn|ielts|skill|kids/i,
  "salon-fitness": /salon|spa|beauty|parlou?r|makeup|barber|gym|fitness|yoga|zumba|crossfit|pilates|studio/i,
  restaurant: /restaurant|cafe|café|biryani|bakery|kitchen|catering|dhaba|tiffin|food|hotel|bar\b/i,
  store: /store|shop|boutique|mart|supermarket|jewel|furniture|electronics|garments|showroom|retail|mobile/i,
  services: /.*/,
};

export function guessType(text: string): BusinessType {
  for (const t of BUSINESS_TYPES) if (t !== "services" && KEYWORDS[t].test(text)) return t;
  return "services";
}

/** Business name = text before the first separator, capped at five words. */
export function guessName(text: string): string {
  const first = text.split(/\s[-–—|:]\s|[,;\n(]/)[0]?.trim() ?? text;
  return first.split(/\s+/).slice(0, 5).join(" ").slice(0, 60) || "Your business";
}

export const SAMPLE_QUESTIONS: Record<BusinessType, [string, string, string]> = {
  clinic: ["Is the doctor available tomorrow evening?", "What is the consultation fee?", "Can I book an appointment for Saturday?"],
  "real-estate": ["Do you have 2BHK flats under my budget?", "Can I visit the site this weekend?", "What documents do I need to book?"],
  education: ["What are the batch timings?", "What is the fee for the next course?", "Can my child attend a demo class?"],
  "salon-fitness": ["Is a slot free this evening?", "What are your membership or package prices?", "Do you offer a free trial?"],
  restaurant: ["Is a table for six free tonight?", "What time do you close?", "Do you take bulk or party orders?"],
  store: ["Is this item in stock?", "Do you deliver to my area?", "What are your store timings today?"],
  services: ["How much would this cost?", "How soon can you visit?", "Can I get a quote today?"],
};

export function buildPersonalisation(p: { businessName: string; type: BusinessType; questions: [string, string, string] }, source: "ai" | "rules"): Personalisation {
  return { ...p, greeting: `Hi, I'm the automated assistant for ${p.businessName}. How can I help?`, source };
}

export function rulesPersonalise(text: string): Personalisation {
  const type = guessType(text);
  return buildPersonalisation({ businessName: guessName(text), type, questions: SAMPLE_QUESTIONS[type] }, "rules");
}

/** Strip control characters and collapse whitespace before text goes anywhere. */
export function sanitise(text: string): string {
  return text.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
}
