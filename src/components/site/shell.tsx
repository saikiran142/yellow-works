import type { ReactNode } from "react";

import { dict } from "@/content/i18n";
import { whatsappHref } from "@/content/site";

import { BottomBar } from "./bottom-bar";
import { Footer } from "./footer";
import { Header } from "./header";

/** Standard marketing page frame: header, content, footer and the mobile action bar. */
export function Shell({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-full bg-signal px-5 py-3 font-semibold text-signal-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {dict.skip}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <BottomBar whatsappHref={whatsappHref()} />
    </>
  );
}

/** Centred content column used by most sections. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }): React.JSX.Element {
  return <div className={`mx-auto max-w-[var(--max-w)] px-[var(--gutter)] ${className}`}>{children}</div>;
}

export function SectionHead({ eyebrow, title, em, lead, id }: { eyebrow?: string; title: string; em?: string; lead?: string; id?: string }): React.JSX.Element {
  return (
    <div className="mb-10 max-w-3xl">
      {eyebrow && <p className="mono mb-3 text-muted">{eyebrow}</p>}
      <h2 id={id} className="text-[length:var(--fs-h2)]">
        {title} {em && <span className="em-serif">{em}</span>}
      </h2>
      {lead && <p className="mt-4 text-muted">{lead}</p>}
    </div>
  );
}
