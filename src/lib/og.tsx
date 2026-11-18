import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Social images are rasterised outside CSS, so they cannot read tokens.css. These mirror the dark
// theme tokens (bg, text, muted, signal, border). Change them together with tokens.css.
// The official dark-theme horizontal logo, embedded as a data URI so the image needs no network access.
const LOGO = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "public/brand/logo-horizontal-dark.svg")).toString("base64")}`;

const C = { bg: "#07090d", text: "#f2f4f7", muted: "#98a2b3", signal: "#d4ff3a", border: "#232a36" };

/** One generator for every page's Open Graph image: dark canvas, signal dot, page title. */
export function renderOg({ title, eyebrow }: { title: string; eyebrow?: string }): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: C.bg, color: C.text, padding: 72, border: `2px solid ${C.border}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} width={328} height={60} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow && <div style={{ fontSize: 28, color: C.muted }}>{eyebrow}</div>}
          <div style={{ fontSize: title.length > 40 ? 64 : 80, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
        </div>
        <div style={{ fontSize: 28, color: C.signal }}>More customers. Less manual work.</div>
      </div>
    ),
    ogSize,
  );
}
