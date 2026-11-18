import { SITE } from "@/content/site";
import type { Service } from "@/content/services";
import { SITE_URL } from "@/lib/seo";

/** Renders one JSON-LD block. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }): React.JSX.Element {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Only confirmed facts go into structured data. Placeholders are left out entirely. */
export function organizationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#org`,
    name: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-horizontal-light-1600w.png`,
    description: "AI automation and digital growth studio in Hyderabad, India. Websites, marketing and AI systems that bring enquiries in, answer them fast and follow up automatically.",
    areaServed: "Hyderabad, India",
    address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN", ...(SITE.address.confirmed ? { streetAddress: SITE.address.value } : {}) },
    ...(SITE.legalEntity.confirmed ? { legalName: SITE.legalEntity.value } : {}),
    ...(SITE.email.confirmed ? { email: SITE.email.value } : {}),
  };
}

export function serviceLd(s: Service): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.answer,
    url: `${SITE_URL}/services#${s.id}`,
    provider: { "@id": `${SITE_URL}/#org` },
    areaServed: "India",
  };
}

export function faqLd(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}
