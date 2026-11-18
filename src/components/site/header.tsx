"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { dict } from "@/content/i18n";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/services", label: dict.nav.services },
  { href: "/demos", label: dict.nav.demos },
  { href: "/industries", label: dict.nav.industries },
  { href: "/pricing", label: dict.nav.pricing },
];

/** Floating glass pill header that condenses on scroll. One signal button. */
export function Header(): React.JSX.Element {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4">
      <div
        className={clsx(
          "glass mx-auto flex items-center justify-between gap-4 rounded-full shadow-float transition-[max-width,padding] duration-300 ease-out",
          condensed ? "max-w-3xl px-4 py-1.5" : "max-w-5xl px-5 py-2.5",
        )}
      >
        <Link href="/" aria-label="The Yellow Works, home">
          <Logo mode="wide" />
        </Link>
        <nav aria-label={dict.nav.main} className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted transition-colors duration-200 ease-out hover:text-text">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Phones get "Book a demo" from the bottom bar, so the header button starts at sm. */}
          <span className="hidden sm:block">
            <ButtonLink href="/book-a-demo" magnetic className="min-h-10 px-5">
              {dict.cta.bookDemo}
            </ButtonLink>
          </span>
        </div>
      </div>
    </header>
  );
}
