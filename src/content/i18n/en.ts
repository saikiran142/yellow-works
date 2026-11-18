/**
 * Interface strings for the site chrome and shared controls, in one dictionary so Telugu and Hindi
 * can be added later (src/content/i18n/te.ts, hi.ts) without touching components. Long-form page
 * copy stays in the typed content files, which are translated per locale when the time comes.
 */
export const en = {
  skip: "Skip to content",
  nav: { services: "Services", demos: "Demos", industries: "Industries", pricing: "Pricing", main: "Main" },
  cta: { bookDemo: "Book a demo", bookPersonalised: "Book a personalised demo", scan: "Get a free growth scan", whatsapp: "WhatsApp", chatWhatsapp: "Chat on WhatsApp" },
  theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
  footer: {
    services: "Services",
    tryIt: "Try it",
    company: "Company",
    tagline: "More customers. Less manual work.",
    note: "Demos use fictional businesses and send nothing to anyone.",
  },
  form: { back: "Back", next: "Next", send: "Send", tryAgain: "Try again" },
} as const;

export type Dict = typeof en;
