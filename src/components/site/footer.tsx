import { dict } from "@/content/i18n";
import { SITE, show, whatsappHref } from "@/content/site";

import { Logo } from "./logo";

const cols = [
  { title: dict.footer.services, links: [["Get found", "/services#get-found"], ["Convert every enquiry", "/services#convert"], ["Run on autopilot", "/services#autopilot"], ["Pricing", "/pricing"]] },
  { title: dict.footer.tryIt, links: [["Demos", "/demos"], ["Free growth scan", "/growth-scan"], ["Book a demo", "/book-a-demo"], ["Industries", "/industries"]] },
  { title: dict.footer.company, links: [["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export function Footer(): React.JSX.Element {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-[var(--max-w)] gap-10 px-[var(--gutter)] py-14 pb-32 md:grid-cols-12 md:pb-14">
        <div className="flex flex-col gap-3 md:col-span-4">
          <Logo mode="wide" />
          <p className="max-w-xs text-sm text-muted">{dict.footer.tagline}</p>
          <address className="text-sm not-italic text-muted">
            <p>{show(SITE.legalEntity)}</p>
            <p>{show(SITE.address)}</p>
            <p>{show(SITE.registration)}</p>
          </address>
          <p className="text-sm">
            {SITE.email.confirmed ? <a className="text-ice underline" href={`mailto:${SITE.email.value}`}>{show(SITE.email)}</a> : <span>{show(SITE.email)}</span>}
            {" · "}
            <a className="text-ice underline" href={whatsappHref()}>WhatsApp {show(SITE.whatsapp)}</a>
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="md:col-span-2 md:col-start-auto">
            <p className="mb-3 font-display font-semibold">{c.title}</p>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              {c.links.map(([label, href]) => (
                <li key={href}><a className="transition-colors duration-200 ease-out hover:text-text" href={href}>{label}</a></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mx-auto max-w-[var(--max-w)] px-[var(--gutter)] pb-24 text-xs text-muted md:pb-8">© {new Date().getFullYear()} {SITE.name}. {dict.footer.note}</p>
    </footer>
  );
}
