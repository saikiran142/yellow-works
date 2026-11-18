import { z } from "zod";

const schema = z.array(z.object({ q: z.string(), a: z.string() }));

export const FAQS = schema.parse([
  { q: "What do you actually do?", a: "We build the websites, marketing and AI systems that bring enquiries in, answer them in under a minute and follow up automatically." },
  { q: "I am not technical. Will I cope?", a: "Yes. We set everything up, train your staff, and the dashboard is built for owners, not engineers." },
  { q: "How long does it take?", a: "Set-up takes about 10 working days from the demo. You review it before it goes live." },
  { q: "Will the assistant pretend to be a person?", a: "No. It says it is automated in its first message, and hands over to your staff for emergencies, complaints and anything it is unsure about." },
  { q: "Can it reply in Telugu and Hindi?", a: "Yes, as well as English. We check the wording with you before launch." },
  { q: "Who owns the accounts and data?", a: "You do. Domain, ad accounts, WhatsApp and CRM are opened in your name, and every contract includes data-protection terms." },
  { q: "What does it cost?", a: "See the pricing page. Set-up is a one-time fee, some packages have a monthly fee, and platform, messaging and ad charges are paid by you directly." },
  { q: "Am I locked in?", a: "After an initial term, it is month-to-month." },
  { q: "Do you guarantee results?", a: "No. We cannot promise a number of customers. We promise fast replies, a clear process and honest monthly reporting." },
  { q: "Is the demo real?", a: "The demos run on fictional businesses, labelled Demo, and nothing is sent to anyone. In your own set-up, the assistant answers from your real details." },
]);
