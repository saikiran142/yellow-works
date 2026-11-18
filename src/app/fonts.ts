import localFont from "next/font/local";

export const geist = localFont({
  src: "../fonts/Geist.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});
export const instrument = localFont({
  src: "../fonts/InstrumentSerif-Italic.woff2",
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
export const inter = localFont({
  src: "../fonts/Inter.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});
export const geistMono = localFont({
  src: "../fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Arial",
});
// Noto Sans Telugu and Devanagari are declared in globals.css with unicode-range so they are only
// downloaded when a page actually shows Telugu or Hindi text.

export const fontVariables = [geist, instrument, inter, geistMono]
  .map((f) => f.variable)
  .join(" ");
