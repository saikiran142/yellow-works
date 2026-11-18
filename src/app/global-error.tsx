"use client";

/** Last-resort boundary when the root layout itself fails. Self-contained: no tokens or fonts assumed. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }): React.JSX.Element {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", maxWidth: "32rem", margin: "0 auto" }}>
        <h1>Something went wrong</h1>
        <p>Please try again in a moment.</p>
        <button type="button" onClick={reset} style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
