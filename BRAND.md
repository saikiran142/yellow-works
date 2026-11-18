# The Yellow Works — Brand sheet (draft v0.1)

**Concept: Signal.** A calm, dark canvas with one vivid citron signal that marks the moment an enquiry is caught.

## Colour (source of truth: `src/design/tokens.css`)
| Token | Dark | Light | Use |
|---|---|---|---|
| bg | #07090D | #F6F5F1 | canvas (60%) |
| surface / surface-2 | #0F131A / #171C26 | #FFFFFF / #EDEBE5 | cards / raised |
| border | #232A36 | #DDD9D0 | hairlines |
| text / muted | #F2F4F7 / #98A2B3 | #0B0D12 / #586172 | type (30%) |
| signal / signal-ink | #D4FF3A / #0B0D12 | same | fills, key numbers, live dots (10%) |
| ice | #7CD4FF | #0B6FA8 | links, focus, data |
| ember | #FF8A5B | #C2491D | rare: alerts, hand-over |
| ok | #4ADE9A | #157F4F | success, always with icon + label |

Rules: signal is never text on light. In the light theme, ember and ok text sit on `bg` or `surface` only (on `surface-2` they fall below 4.5:1). `npm run contrast` checks every pair per theme.

## Type
Display Geist 500–700, tight tracking · one Instrument Serif italic word per headline · body Inter 16–18px / 1.6 · Geist Mono for timestamps, counters, data labels · Noto Sans Telugu / Devanagari. All self-hosted, `font-display: swap`.

## Logo
Official logo system in `public/brand/` (full usage rules in `public/brand/LOGO-README.md`). The mark is a Y drawn as a tick, with a separate signal dot.
- Header and footer: `logo-horizontal-dark.svg` on the dark theme, `logo-horizontal-light.svg` on the light theme (swapped in CSS, no flash). The light files use the deeper signal green, as the rules require on light backgrounds.
- Mark only (`mark-dark/light.svg`): `<Logo mode="mark" />`, for very tight spaces.
- Favicons, Apple touch icon and PWA icons are in `public/` and wired in `src/app/layout.tsx` and `public/site.webmanifest`.
- Social images embed `logo-horizontal-dark.svg` (`src/lib/og.tsx`). Structured data points at `logo-horizontal-light-1600w.png`.
- Do not recolour, separate the dot, stretch or add effects. Minimum size: mark 16px, horizontal logo 120px wide.

## Motion
150–300ms ease-out for micro-interactions. Aurora drifts slowly at very low opacity. Headline reveal plays once. No scroll-jacking, autoplay video, 3D or load pop-ups. `prefers-reduced-motion` removes all animation.

## Rules added during the build
- Glass blur only on floating elements (header, bottom bar, tooltips, toasts, phone chrome in demos). Cards use a plain surface.
- No `mix-blend-mode` or animated `filter` on large areas; they cost far more than they add.
- Inactive text is never dimmed with opacity: it must keep AA contrast. Emphasise the active item with a border or marker instead.
- Social images mirror the dark-theme tokens in `src/lib/og.tsx`; change them together with `tokens.css`.
- Unconfirmed facts (prices, entity, founders) render in [square brackets] and stay out of structured data.
