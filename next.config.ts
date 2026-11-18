import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy. No third-party scripts, fonts, frames or connections are used, so
 * everything is same-origin. 'unsafe-inline' remains for scripts because Next.js emits inline
 * bootstrap scripts and the theme script runs before paint; moving to per-request nonces would make
 * every page dynamic (no static HTML), so that upgrade is a deliberate later trade-off.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // No upgrade-insecure-requests: HSTS already forces https in production, and the directive
  // breaks asset loading when the production build is served over http (local runs, CI).
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Inline the (small) stylesheet into the HTML: removes one render-blocking round trip.
  experimental: { inlineCss: true },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/_next/static/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default config;
