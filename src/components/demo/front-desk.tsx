"use client";

import clsx from "clsx";
import { useState } from "react";

import { usePersona } from "@/components/persona-context";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { DEMO_BUSINESSES } from "@/content/demo-businesses";
import type { BusinessType } from "@/lib/demo/types";

import { CustomerPane } from "./customer-pane";
import { DashboardPane } from "./dashboard-pane";
import { useFrontDesk } from "./use-front-desk";

export function FrontDeskDemo({ defaultType }: { defaultType?: BusinessType }): React.JSX.Element {
  const fd = useFrontDesk(defaultType);
  const { persona } = usePersona();
  const [view, setView] = useState<"customer" | "dashboard">("customer");
  const personalised = persona && persona.type === fd.type;
  const done = fd.capped || Boolean(fd.appointment) || fd.lead?.status === "needs_staff";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Industry" className="flex gap-2 overflow-x-auto pb-1">
          {DEMO_BUSINESSES.map((b) => (
            <Chip key={b.type} selected={fd.type === b.type} onClick={() => fd.changeType(b.type)} className="shrink-0">
              {b.industryLabel}
            </Chip>
          ))}
        </div>
        {personalised && <Badge tone="signal" className="self-start">Personalised for {persona.businessName}</Badge>}
      </div>

      {/* Mobile: tabs. Desktop: split view. */}
      <div role="tablist" aria-label="Demo view" className="inline-flex gap-1 self-start rounded-full border border-border bg-surface p-1 lg:hidden">
        {(["customer", "dashboard"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={clsx("min-h-10 rounded-full px-5 text-sm font-medium transition-colors duration-200 ease-out", view === v ? "bg-signal text-signal-ink" : "text-muted hover:text-text")}
          >
            {v === "customer" ? "Your customer" : "Your dashboard"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="fd-customer" className={clsx(view !== "customer" && "hidden lg:block")}>
          <h3 id="fd-customer" className="mb-4 hidden font-display text-lg lg:block">Your customer</h3>
          <CustomerPane fd={fd} extraQuestions={personalised ? persona.questions : []} />
        </section>
        <section aria-labelledby="fd-dash" className={clsx(view !== "dashboard" && "hidden lg:block")}>
          <h3 id="fd-dash" className="mb-4 hidden font-display text-lg lg:block">Your dashboard</h3>
          <DashboardPane fd={fd} />
        </section>
      </div>

      {done && (
        <div className="card flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <p className="max-w-xl font-display text-xl font-semibold">Want this running with your own business details? We build it in 48 hours, free.</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/book-a-demo" magnetic>Book a demo</ButtonLink>
            <Button variant="secondary" onClick={fd.restart}>Try again</Button>
          </div>
        </div>
      )}
    </div>
  );
}
