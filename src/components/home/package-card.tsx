import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PACKAGES, price, type Pkg } from "@/content/packages";
import { getService } from "@/content/services";

function allServiceIds(pkg: Pkg): string[] {
  const parent = pkg.includes ? PACKAGES.find((p) => p.id === pkg.includes) : undefined;
  return [...(parent ? allServiceIds(parent) : []), ...pkg.services];
}

export function PackageCard({ pkg, compact = false }: { pkg: Pkg; compact?: boolean }): React.JSX.Element {
  const own = pkg.services.map((id) => getService(id)?.name).filter(Boolean) as string[];
  const parent = pkg.includes ? PACKAGES.find((p) => p.id === pkg.includes) : undefined;
  return (
    <Card className={clsx("flex h-full flex-col gap-5", pkg.featured && "border-signal")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[length:var(--fs-h3)]">{pkg.name}</h3>
        {pkg.featured && <Badge tone="signal">Most chosen for replies</Badge>}
      </div>
      <p className="text-muted">{pkg.tagline}</p>
      <div>
        <p className="mono text-2xl font-semibold">{price(pkg.setup)}<span className="ml-2 text-sm font-normal text-muted">set-up, one time</span></p>
        {pkg.monthly && <p className="mono mt-1 text-lg">{price(pkg.monthly)}<span className="ml-2 text-sm text-muted">a month{pkg.plusAdSpend ? " plus ad spend" : ""}</span></p>}
        {!pkg.monthly && <p className="mt-1 text-sm text-muted">No monthly fee.</p>}
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {parent && <li className="flex gap-2"><span aria-hidden="true" className="text-ok">✓</span>Everything in {parent.name}</li>}
        {(compact ? own.slice(0, 3) : own).map((n) => (
          <li key={n} className="flex gap-2"><span aria-hidden="true" className="text-ok">✓</span>{n}</li>
        ))}
        {compact && own.length > 3 && <li className="text-muted">and {own.length - 3} more</li>}
      </ul>
      {!compact && <p className="text-sm text-muted">Best for: {pkg.bestFor}</p>}
      <ButtonLink href="/book-a-demo" variant={pkg.featured ? "primary" : "secondary"} className="mt-auto">Book a demo</ButtonLink>
    </Card>
  );
}

export { allServiceIds };
