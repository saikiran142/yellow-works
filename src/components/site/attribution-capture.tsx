"use client";

import { useEffect } from "react";

import { captureAttribution } from "@/lib/attribution";

/** Records UTM source/campaign once per visit. Renders nothing. */
export function AttributionCapture(): null {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
