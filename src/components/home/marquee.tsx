const items = ["Clinics", "Real estate", "Education centres", "Salons and gyms", "Restaurants", "Stores", "Professional firms", "Local services"];

/** CSS-only marquee. Pauses on hover; reduced motion renders a static wrapped list. */
export function Marquee(): React.JSX.Element {
  return (
    <section aria-label="Industries we build for" className="border-y border-border py-5">
      <p className="sr-only">Built for {items.join(", ")}.</p>
      <div className="marquee overflow-hidden" aria-hidden="true">
        <div className="marquee-track flex w-max gap-10 text-muted">
          {[...items, ...items].map((it, i) => (
            <span key={`${it}-${i}`} className="flex items-center gap-10 whitespace-nowrap font-display text-lg">
              {it}
              <span className="size-1.5 rounded-full bg-signal" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
