"use client";

import clsx from "clsx";
import type { HTMLAttributes, PointerEvent } from "react";

/** Surface card with a cursor-following spotlight and a signal border on hover. */
export function Card({ className, onPointerMove, ...rest }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const handle = (e: PointerEvent<HTMLDivElement>): void => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    onPointerMove?.(e);
  };
  return <div data-glow {...rest} onPointerMove={handle} className={clsx("card p-6 md:p-8", className)} />;
}

/** 12-column bento container. Children set their own col/row spans; DOM order = reading order. */
export function Bento({ className, ...rest }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div {...rest} className={clsx("grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12", className)} />;
}
