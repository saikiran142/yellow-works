import { z } from "zod";

import { BUSINESS_TYPES, DAYS } from "@/lib/demo/types";

/**
 * Fictional demo businesses (all shown with a "Demo" label). Adding an industry = adding an entry here.
 * Prices are illustrative only. Per-business knowledge is the ONLY source the assistant may answer from.
 */
const schema = z.object({
  type: z.enum(BUSINESS_TYPES),
  industryLabel: z.string(),
  name: z.string(),
  area: z.string(),
  hours: z.object({ from: z.enum(DAYS), to: z.enum(DAYS), open: z.string(), close: z.string() }),
  services: z.array(z.object({ name: z.string(), price: z.string() })).min(2),
  slots: z.array(z.object({ day: z.enum(DAYS), time: z.string() })).min(2),
});
export type DemoBusiness = z.infer<typeof schema>;

const raw: DemoBusiness[] = [
  {
    type: "clinic",
    industryLabel: "Clinic",
    name: "Sunrise Dental",
    area: "Madhapur, Hyderabad",
    hours: { from: "mon", to: "sat", open: "10 am", close: "8 pm" },
    services: [
      { name: "Consultation", price: "₹500" },
      { name: "Teeth cleaning", price: "₹1,200" },
      { name: "Root canal", price: "from ₹4,500" },
    ],
    slots: [
      { day: "fri", time: "6:00 pm" },
      { day: "sat", time: "11:00 am" },
      { day: "sat", time: "5:00 pm" },
    ],
  },
  {
    type: "real-estate",
    industryLabel: "Real estate",
    name: "Lakeview Homes",
    area: "Kondapur, Hyderabad",
    hours: { from: "mon", to: "sun", open: "10 am", close: "7 pm" },
    services: [
      { name: "2BHK site visit", price: "free" },
      { name: "3BHK site visit", price: "free" },
      { name: "Booking amount", price: "₹1,00,000" },
    ],
    slots: [
      { day: "sat", time: "11:00 am" },
      { day: "sat", time: "4:00 pm" },
      { day: "sun", time: "11:00 am" },
    ],
  },
  {
    type: "education",
    industryLabel: "Education",
    name: "Bright Minds Academy",
    area: "Kukatpally, Hyderabad",
    hours: { from: "mon", to: "sat", open: "9 am", close: "7 pm" },
    services: [
      { name: "Demo class", price: "free" },
      { name: "Monthly batch", price: "₹3,000" },
      { name: "Weekend batch", price: "₹2,200" },
    ],
    slots: [
      { day: "mon", time: "5:00 pm" },
      { day: "wed", time: "5:00 pm" },
      { day: "sat", time: "10:00 am" },
    ],
  },
  {
    type: "salon-fitness",
    industryLabel: "Salon and fitness",
    name: "Glow Studio",
    area: "Jubilee Hills, Hyderabad",
    hours: { from: "mon", to: "sun", open: "9 am", close: "9 pm" },
    services: [
      { name: "Haircut", price: "₹400" },
      { name: "Facial", price: "₹1,500" },
      { name: "Monthly gym pass", price: "₹1,800" },
    ],
    slots: [
      { day: "fri", time: "6:00 pm" },
      { day: "sat", time: "12:00 pm" },
      { day: "sun", time: "5:00 pm" },
    ],
  },
  {
    type: "restaurant",
    industryLabel: "Restaurant",
    name: "Spice Route",
    area: "Banjara Hills, Hyderabad",
    hours: { from: "mon", to: "sun", open: "12 pm", close: "11 pm" },
    services: [
      { name: "Table for 2", price: "no charge" },
      { name: "Table for 6", price: "no charge" },
      { name: "Party hall (20 people)", price: "₹12,000 minimum" },
    ],
    slots: [
      { day: "fri", time: "8:00 pm" },
      { day: "sat", time: "8:30 pm" },
      { day: "sun", time: "1:00 pm" },
    ],
  },
  {
    type: "store",
    industryLabel: "Store",
    name: "Metro Mobiles",
    area: "Ameerpet, Hyderabad",
    hours: { from: "mon", to: "sat", open: "10 am", close: "9 pm" },
    services: [
      { name: "Screen guard fitting", price: "₹299" },
      { name: "Phone service check", price: "₹199" },
      { name: "Accessory orders", price: "price on request" },
    ],
    slots: [
      { day: "fri", time: "7:00 pm" },
      { day: "sat", time: "11:00 am" },
      { day: "sat", time: "6:00 pm" },
    ],
  },
  {
    type: "services",
    industryLabel: "Services",
    name: "QuickFix Home Services",
    area: "Gachibowli, Hyderabad",
    hours: { from: "mon", to: "sat", open: "8 am", close: "8 pm" },
    services: [
      { name: "AC service", price: "₹600" },
      { name: "Plumbing visit", price: "₹350" },
      { name: "Electrician visit", price: "₹300" },
    ],
    slots: [
      { day: "fri", time: "10:00 am" },
      { day: "sat", time: "10:00 am" },
      { day: "sat", time: "3:00 pm" },
    ],
  },
];

export const DEMO_BUSINESSES: DemoBusiness[] = raw.map((b) => schema.parse(b));

export function getDemoBusiness(type: (typeof BUSINESS_TYPES)[number]): DemoBusiness {
  return DEMO_BUSINESSES.find((b) => b.type === type) ?? (DEMO_BUSINESSES[0] as DemoBusiness);
}
