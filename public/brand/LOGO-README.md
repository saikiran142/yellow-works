# The Yellow Works — logo system

## The idea
The mark is a **Y** drawn so its arms form a **tick**: the short stroke and the long rising stroke say "done for you" (less manual work). The stem turns the tick into the **Y** of Yellow. The separate **signal dot** sits where the rising stroke points: a new customer arriving (more customers). One shape, the whole motto: *More customers. Less manual work.*

## Files
| File | Use |
|---|---|
| `mark-dark.svg` / `mark-light.svg` | Symbol alone on dark / light backgrounds |
| `mark-currentcolor.svg` | Inline on the website: strokes follow CSS `color`, dot follows `--tyw-signal` |
| `mark-mono-black.svg` / `mark-mono-white.svg` | One-colour uses (print, stamps, partner pages) |
| `logo-horizontal-*.svg` | Primary logo: header, documents, email signatures |
| `logo-tagline-*.svg` | With the motto: hero, decks, proposals |
| `logo-stacked-*.svg` | Square-ish spaces: social profiles, splash screens |
| `app-icon-1024.svg` + `png/app-icon-1024.png` | iOS App Store and Google Play master (full-bleed square; the OS rounds corners) |
| `android-adaptive-foreground.svg` / `-background.svg` / `android-monochrome.svg` | Android adaptive and themed icons (108dp canvas) |
| `pwa-maskable-512.svg` + PNGs | Web app manifest "maskable" icons |
| `favicon.svg`, `favicon.ico`, `png/favicon-*.png`, `png/apple-touch-icon-180.png` | Browser tabs and home-screen bookmarks |
| `png/logo-*-1600w.png` | Raster lockups for tools that do not accept SVG |
| `preview.html` | Visual check of every variant |

All text is converted to outlines (font: Geist SemiBold and Geist Mono, SIL Open Font License), so no font is required to display the logo.

## Colours
| Name | Hex | Where |
|---|---|---|
| Night | `#07090D` | Dark backgrounds, app icon |
| Paper | `#F2F4F7` | Mark and text on dark |
| Ink | `#0B0D12` | Mark and text on light |
| Signal | `#D4FF3A` | The dot on dark backgrounds (17:1 on Night) |
| Signal Deep | `#5E7A00` | The dot on light backgrounds (4.5:1 on light) — never use bright Signal on white |
| Ice | `#7CD4FF` | Subtle glow in the app icon only |

## Rules
- **Clear space:** keep empty space around the logo at least the diameter of the signal dot × 2.
- **Minimum size:** mark 16px; horizontal logo 120px wide; tagline version 240px wide.
- Do not recolour the strokes, separate the dot, rotate, stretch, add shadows or outlines, or place the dark version on busy photos.
- On photos or colour backgrounds use `mono-white` or `mono-black`.

## Website snippet
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#07090D">
```
```json
{
  "name": "The Yellow Works",
  "short_name": "Yellow Works",
  "background_color": "#07090D",
  "theme_color": "#07090D",
  "icons": [
    { "src": "/app-icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/app-icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/pwa-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/pwa-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
Inline, themeable mark in React:
```tsx
// strokes use the text colour; set --tyw-signal for the dot
<span style={{ color: "var(--text)", ["--tyw-signal" as any]: "#D4FF3A" }}>
  {/* paste the contents of mark-currentcolor.svg here, or import it with SVGR */}
</span>
```

## Mobile apps
- **iOS / Expo:** use `png/app-icon-1024.png` as the app icon (no transparency, no rounded corners — iOS applies the mask).
- **Android:** use `android-adaptive-foreground.svg` and `android-adaptive-background.svg` as the adaptive icon layers (import as Vector Assets in Android Studio, or the 432px PNGs in Expo `adaptiveIcon`), and `android-monochrome.svg` for themed icons.
- **Splash screen:** `logo-stacked-dark.svg` centred on `#07090D`.

## Before you register it
Search the trademark register (classes 35 and 42) and the web for similar marks before filing. This design is original, but a clearance search is the only way to be sure no one has registered something similar.
