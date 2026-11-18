import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { JsonLd, organizationLd } from "@/components/seo/json-ld";
import { PersonaProvider } from "@/components/persona-context";
import { AttributionCapture } from "@/components/site/attribution-capture";
import { Ambient } from "@/components/site/ambient";

import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "The Yellow Works", template: "%s · The Yellow Works" },
  description: "More customers. Less manual work. Websites, marketing and AI systems for small businesses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
 alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon-180.png",
  },
  manifest: "/site.webmanifest",
  openGraph: { type: "website", siteName: "The Yellow Works", locale: "en_IN", title: "The Yellow Works", description: "More customers. Less manual work." },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint so the saved theme never flashes. Dark is the default.
const themeScript = `try{var t=localStorage.getItem("tyw-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <html lang="en" data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <JsonLd data={organizationLd()} />
        <Ambient />
        <AttributionCapture />
        <PersonaProvider>{children}</PersonaProvider>
      </body>
    </html>
  );
}
