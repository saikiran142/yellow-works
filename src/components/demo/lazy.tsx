"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type { BusinessType } from "@/lib/demo/types";

/**
 * Mounts its children only when they are about to scroll into view. Keeps below-the-fold demos
 * (their JavaScript, hydration work and Telugu/Hindi font downloads) off the critical path.
 * The reserved height prevents layout shift.
 */
export function LazyMount({ children, label }: { children: ReactNode; label: string }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={show ? undefined : "min-h-[44rem]"}>
      {show ? children : <div role="status" aria-label={`Loading ${label}`} className="skeleton h-[44rem] rounded-card" />}
    </div>
  );
}

const FrontDesk = dynamic(() => import("./front-desk").then((m) => m.FrontDeskDemo), { ssr: false });
const Autopilot = dynamic(() => import("./autopilot/autopilot-demo").then((m) => m.AutopilotDemo), { ssr: false });

export function LazyFrontDesk({ defaultType }: { defaultType?: BusinessType }): React.JSX.Element {
  return (
    <LazyMount label="AI Front Desk demo">
      <FrontDesk defaultType={defaultType} />
    </LazyMount>
  );
}

export function LazyAutopilot(): React.JSX.Element {
  return (
    <LazyMount label="Lead Autopilot demo">
      <Autopilot />
    </LazyMount>
  );
}
