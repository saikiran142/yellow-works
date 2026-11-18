import { z } from "zod";

import { HEADACHES } from "@/lib/leads/options";

/**
 * Services as data. Adding a service = adding an entry here: the Services page, the home bento,
 * the Growth Scan recommendations and industry pages all read this list.
 * No results are promised and no statistics are claimed. Stand-alone prices are unconfirmed
 * placeholders until the owner signs them off; package prices live in packages.ts.
 */
const schema = z.object({
  id: z.string(),
  group: z.enum(["get-found", "convert", "autopilot", "on-request"]),
  name: z.string(),
  summary: z.string(),
  /** Two sentences that answer "what is this?" directly (shown first; used for search and AI answers). */
  answer: z.string(),
  problem: z.string(),
  gets: z.array(z.string()).min(3),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
  solves: z.array(z.enum(HEADACHES)),
  tags: z.array(z.enum(["speed", "organise", "reach"])),
});
export type Service = z.infer<typeof schema>;

export const GROUP_LABEL = { "get-found": "Get found", convert: "Convert every enquiry", autopilot: "Run on autopilot", "on-request": "On request" } as const;
export type ServiceGroup = keyof typeof GROUP_LABEL;

export const GROUP_BLURB: Record<ServiceGroup, string> = {
  "get-found": "People nearby search for what you do. Make sure they find you, and that you look worth calling.",
  convert: "An enquiry that waits goes cold. Reply fast, book it, remind them, and ask for the review.",
  autopilot: "Hand the routine work to software, so your team spends its time on customers.",
  "on-request": "Not for everyone. We build these when there is a clear need.",
};

const raw: Service[] = [
  {
    id: "websites", group: "get-found", name: "Websites and landing pages",
    summary: "Fast, clear pages that turn visitors into enquiries.",
    answer: "We build a fast, mobile-first website or landing page for your business. Every page is designed to get a visitor to call, message or book.",
    problem: "Your site is slow, hard to read on a phone, or does not make it obvious how to enquire.",
    gets: ["A mobile-first site in your brand, in English and one local language if you wish", "Click-to-call, WhatsApp and booking buttons on every page", "Basic search set-up so Google can read your pages"],
    faq: [{ q: "Do I own the website?", a: "Yes. The domain and hosting accounts are opened in your name." }, { q: "Can you rebuild my current site?", a: "Yes. We keep what works and rebuild what does not." }],
    solves: ["few-enquiries"], tags: ["reach"],
  },
  {
    id: "local-search", group: "get-found", name: "Google Business Profile and local search",
    summary: "Show up when people nearby search for what you do.",
    answer: "We set up and tune your Google Business Profile so you appear in local searches and maps. We keep your hours, photos, services and posts current.",
    problem: "People searching nearby find your competitors first, or find wrong timings and old photos for you.",
    gets: ["A complete, accurate Business Profile", "Regular posts, photos and updated hours", "A simple way for customers to leave reviews"],
    faq: [{ q: "Can you guarantee a top ranking?", a: "No one can. We make your profile complete and active, which is what we control." }],
    solves: ["few-enquiries", "few-reviews"], tags: ["reach"],
  },
  {
    id: "ai-search", group: "get-found", name: "AI-search readiness",
    summary: "Make your business easy for AI assistants to find and describe correctly.",
    answer: "People now ask AI assistants for recommendations, and those assistants read your website. We structure your pages so your services, prices and location are described correctly.",
    problem: "AI assistants describe your business wrongly or skip it because your pages are vague.",
    gets: ["Clear service and FAQ pages written as direct answers", "Structured data so machines can read your details", "A check of how major assistants describe you today"],
    faq: [{ q: "Will this get me recommended by AI tools?", a: "We cannot promise that. We remove the reasons you would be skipped or described wrongly." }],
    solves: ["few-enquiries"], tags: ["reach"],
  },
  {
    id: "ads", group: "get-found", name: "Google and Meta ads",
    summary: "Paid campaigns that send enquiries straight to your reply system.",
    answer: "We run Google and Meta ad campaigns that send people to a page built to convert. Each enquiry lands in your reply system so it is answered immediately.",
    problem: "Ad money is spent, but enquiries are slow to be answered, so many go cold.",
    gets: ["Campaign set-up in your own ad accounts", "Landing pages and tracking so you see what each rupee brings", "Enquiries connected to instant reply and follow-up"],
    faq: [{ q: "Who pays the ad platforms?", a: "You pay Google and Meta directly. Our fee is separate from ad spend." }],
    solves: ["few-enquiries"], tags: ["reach"],
  },
  {
    id: "content", group: "get-found", name: "AI-drafted, human-edited content and social",
    summary: "Regular posts that sound like you, checked by a person.",
    answer: "We draft posts, captions and articles with AI, then a person edits them to match your voice and facts. You approve before anything is published.",
    problem: "You know you should post regularly, but nobody has the time.",
    gets: ["A monthly content plan for your business", "Drafts edited by a person, never auto-published", "Posts sized for Instagram, Facebook and Google"],
    faq: [{ q: "Will it sound like AI?", a: "A person edits every piece. If it does not sound like you, we change it." }],
    solves: ["few-enquiries"], tags: ["reach"],
  },
  {
    id: "whatsapp-assistant", group: "convert", name: "WhatsApp AI assistant",
    summary: "Answers customers in under a minute, day and night, and hands over to your team when needed.",
    answer: "A WhatsApp assistant that answers common questions from your own business details, in English, Telugu or Hindi. It says it is automated and hands over to your staff for emergencies, complaints and anything it is unsure about.",
    problem: "Customers write at night or while you are busy, and by the time you reply they have gone elsewhere.",
    gets: ["Replies in under a minute, built from your services, prices and hours", "Booking requests captured and passed to your calendar", "Handover to your staff, with the conversation attached"],
    faq: [{ q: "Does it pretend to be a person?", a: "No. It says it is automated in its first message." }, { q: "What if it does not know the answer?", a: "It says so and asks your team to reply." }],
    solves: ["slow-replies", "staff-time"], tags: ["speed"],
  },
  {
    id: "website-assistant", group: "convert", name: "Website AI assistant",
    summary: "Answers questions on your site and captures the lead.",
    answer: "A chat assistant on your website that answers visitors' questions from your own details. When someone is ready, it collects their enquiry and sends it to you.",
    problem: "Visitors have a question, cannot find the answer, and leave without enquiring.",
    gets: ["An assistant trained on your services and FAQs", "Leads sent to you by WhatsApp or email", "A clear handover to your staff"],
    faq: [{ q: "Can it take payments?", a: "No. It answers questions and captures enquiries." }],
    solves: ["slow-replies", "few-enquiries"], tags: ["speed"],
  },
  {
    id: "lead-follow-up", group: "convert", name: "Instant lead follow-up",
    summary: "Every new enquiry gets a reply and a follow-up plan automatically.",
    answer: "Every new enquiry from any source gets an instant reply, and follow-ups are scheduled for day 1, 3 and 7. Your team is alerted so a person can step in at the right moment.",
    problem: "Enquiries arrive from many places and follow-up depends on someone remembering.",
    gets: ["Instant reply on WhatsApp and email", "Follow-ups on day 1, 3 and 7 that stop when the customer replies", "A staff alert with a suggested next step"],
    faq: [{ q: "Will customers feel spammed?", a: "Follow-ups are short, limited to three, and stop as soon as the customer replies or opts out." }],
    solves: ["no-follow-up", "slow-replies"], tags: ["speed", "organise"],
  },
  {
    id: "booking", group: "convert", name: "Booking and reminders",
    summary: "Online booking with reminders that cut no-shows.",
    answer: "Customers book a slot online or in chat, and the booking lands in your calendar. Reminders go out before the visit so fewer people forget.",
    problem: "Slots are booked by phone call and customers forget to turn up.",
    gets: ["Booking from your website and WhatsApp", "Reminders before every appointment", "Reschedule and cancel links"],
    faq: [{ q: "Can I block my own time?", a: "Yes. Your working hours and blocked time are respected." }],
    solves: ["no-shows"], tags: ["organise"],
  },
  {
    id: "reviews", group: "convert", name: "Review requests and replies",
    summary: "Ask happy customers for reviews and reply to every one.",
    answer: "After a visit we ask the customer for a review with one tap, and draft replies to every review for you to approve. A steady flow of honest reviews helps new customers choose you.",
    problem: "Happy customers rarely post reviews unless asked, and reviews go unanswered.",
    gets: ["A review request sent after each completed visit", "Draft replies you approve", "Alerts for low ratings so you can respond personally"],
    faq: [{ q: "Do you buy or fake reviews?", a: "Never. We only ask real customers for honest reviews." }],
    solves: ["few-reviews"], tags: ["reach"],
  },
  {
    id: "automation", group: "autopilot", name: "Workflow automation",
    summary: "Hand routine tasks to software so staff handle people.",
    answer: "We connect your tools so routine tasks, like logging a lead or sending a confirmation, happen without anyone doing them. Your team keeps the work that needs a person.",
    problem: "Staff retype the same details into several places and miss steps when busy.",
    gets: ["Your repeated tasks mapped and automated", "Connections between your forms, WhatsApp, calendar and sheets", "A simple log showing what ran and when"],
    faq: [{ q: "What if a step fails?", a: "Failures are logged and flagged to you, and steps are safe to retry." }],
    solves: ["staff-time", "no-follow-up"], tags: ["organise"],
  },
  {
    id: "crm", group: "autopilot", name: "CRM set-up with AI summaries",
    summary: "One place for every lead, with short summaries of each conversation.",
    answer: "We set up a simple CRM in your name where every lead and conversation lives. AI writes a short summary of each, so anyone on your team can pick up where it was left.",
    problem: "Leads are scattered across phones, chats and notebooks.",
    gets: ["A CRM set up around how you sell", "Short AI summaries of each conversation", "Your existing contacts imported"],
    faq: [{ q: "Who owns the data?", a: "You do. The CRM account is in your name." }],
    solves: ["no-follow-up", "staff-time"], tags: ["organise"],
  },
  {
    id: "weekly-report", group: "autopilot", name: "Weekly AI business report",
    summary: "A plain one-page report of leads, replies and bookings.",
    answer: "Every week you get a one-page report of enquiries, reply times and bookings, with a short plain-language summary. It shows what is working and what needs attention.",
    problem: "You do not know how many enquiries came in, or how many were answered.",
    gets: ["Weekly numbers from your own systems", "A short written summary", "One suggested action for next week"],
    faq: [{ q: "Where do the numbers come from?", a: "Only from your own connected systems. We do not estimate or invent figures." }],
    solves: ["staff-time"], tags: ["organise"],
  },
  {
    id: "documents", group: "on-request", name: "Document processing",
    summary: "Pull data out of forms, bills and reports.",
    answer: "We read your forms, bills or reports and pull the details into a sheet or system. A person reviews anything the software is unsure about.",
    problem: "Staff type data in by hand from paper or PDFs.",
    gets: ["Extraction set up for your documents", "A review step for uncertain fields", "Output to your sheet or software"],
    faq: [{ q: "How private is it?", a: "We agree handling terms first. Sensitive documents need a specific data agreement." }],
    solves: ["staff-time"], tags: ["organise"],
  },
  {
    id: "knowledge", group: "on-request", name: "Internal knowledge assistant",
    summary: "Staff ask questions and get answers from your own documents.",
    answer: "Your staff ask a question and get an answer drawn from your own documents, with the source shown. It helps new staff learn faster and cuts repeated questions.",
    problem: "The same questions keep going to the owner or senior staff.",
    gets: ["An assistant limited to your documents", "Sources shown with each answer", "Access limited to your team"],
    faq: [{ q: "Can it answer from outside my documents?", a: "It is set to answer only from your material, and says when it cannot find an answer." }],
    solves: ["staff-time"], tags: ["organise"],
  },
  {
    id: "voice", group: "on-request", name: "Inbound voice receptionist",
    summary: "Answers phone calls and books appointments.",
    answer: "A voice assistant that answers incoming calls, answers common questions and books appointments. It says it is automated and passes callers to a person when needed.",
    problem: "Calls go unanswered while you are with a customer.",
    gets: ["A call flow built around your business", "Bookings added to your calendar", "Handover to a person for anything urgent"],
    faq: [{ q: "Does it handle emergencies?", a: "No. It identifies urgent calls and hands them to your staff straight away." }],
    solves: ["slow-replies"], tags: ["speed"],
  },
];

export const SERVICES: Service[] = raw.map((s) => schema.parse(s));
export const getService = (id: string): Service | undefined => SERVICES.find((s) => s.id === id);
