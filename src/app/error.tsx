"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Route-level error boundary: a calm message and a way forward, never a blank page. */
export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center gap-5 px-[var(--gutter)]">
      <p className="mono text-muted">Something went wrong</p>
      <h1 className="text-[length:var(--fs-h1)]">That did not <span className="em-serif">load.</span></h1>
      <p className="text-muted">It is on our side. Please try again, or message us on WhatsApp and we will help directly.</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link className="inline-flex min-h-12 items-center rounded-full border border-border px-6 font-display font-semibold" href="/">Go home</Link>
      </div>
    </main>
  );
}
