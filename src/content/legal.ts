import { SITE, show } from "./site";

/**
 * Plain-language TEMPLATES with placeholders. They are drafts for the owner and a lawyer to review
 * before launch; they are not legal advice. Square brackets mark values still to be confirmed.
 */
export interface LegalSection {
  heading: string;
  body: string[];
}

export const LEGAL_NOTICE = "Draft template. Placeholders in [square brackets] must be filled and the text reviewed by a qualified lawyer before launch.";

export const PRIVACY: LegalSection[] = [
  { heading: "Who we are", body: [`${SITE.name} is operated by ${show(SITE.legalEntity)}, ${show(SITE.address)}. Contact: ${show(SITE.email)}.`] },
  { heading: "What we collect", body: ["When you fill in Book a demo or the Growth Scan: your name, business details, WhatsApp number or email, and your answers. You give these to us on purpose, and only after you tick the consent box.", "We also record which page or campaign brought you here (for example a UTM tag) so we know what is working. We do not use advertising cookies or third-party trackers on this site."] },
  { heading: "What we do not store", body: ["The demos on this site (AI Front Desk and Lead Autopilot) run on fictional businesses. What you type into a demo is used to produce the reply and is not stored. Please do not type personal details of real people into a demo.", "The business name and description you type into the home page box is used only to personalise that visit and is not stored."] },
  { heading: "How we use it", body: ["To contact you about the demo or scan you asked for, and to send the result you requested. We do not sell your details."] },
  { heading: "Who processes it", body: [`We use service providers to run the site and, for some demo replies, an AI model provider [name of provider and country]. Lead details are stored with [database provider and region] and alerts go to our own team channel.`] },
  { heading: "How long we keep it", body: [`We keep lead details for [retention period], then delete or anonymise them. You can ask us to delete your details sooner.`] },
  { heading: "Your rights", body: [`You can ask to see, correct or delete your details, and withdraw consent at any time, under the data-protection law that applies to you. Write to ${show(SITE.email)}.`] },
  { heading: "Changes", body: ["If we change this policy we will update the date below. Last updated: [date]."] },
];

export const TERMS: LegalSection[] = [
  { heading: "About these terms", body: [`These terms apply to your use of this website and to the free demo and scan. Paid services are covered by a separate written agreement. The provider is ${show(SITE.legalEntity)}.`] },
  { heading: "The website and demos", body: ["Demos and the Growth Scan are illustrations on fictional businesses and example numbers. Scores, estimates and sample replies are not advice and are not a promise of results."] },
  { heading: "Estimates", body: ["The Growth Scan estimate uses the numbers you enter and an editable planning assumption. It is not a measured loss or a prediction."] },
  { heading: "Fees", body: ["Our fees are set out in your agreement. Platform, messaging and ad charges (for example WhatsApp, Google and Meta) are paid by you directly to those providers."] },
  { heading: `Founding-client offer`, body: [`Limited to ${show(SITE.foundingSlots)} clients. Offer terms: ${show(SITE.foundingTerms)}.`] },
  { heading: "Your accounts and data", body: ["Accounts we set up for you (domain, ad accounts, messaging, CRM) are opened in your name. Your data remains yours."] },
  { heading: "Term and cancellation", body: [`After an initial term of ${show(SITE.initialTerm)}, services continue month-to-month. Notice period: [notice period].`] },
  { heading: "Liability", body: ["[Liability wording to be added by your lawyer.]"] },
  { heading: "Governing law", body: [`These terms are governed by the laws of ${show(SITE.governingLaw)}. Courts at [city] have jurisdiction.`] },
  { heading: "Contact", body: [`${show(SITE.email)}, ${show(SITE.address)}.`] },
];
