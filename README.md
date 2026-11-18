# theyellowworks.com

Marketing site for **The Yellow Works**, an AI automation and digital growth studio in Hyderabad.
Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · Postgres (SQLite locally).

Two interactive demos (AI Front Desk, Lead Autopilot), a personalised hero, a lead system
(Book a demo, Growth Scan), and a password-protected admin.

## Run locally

```bash
npm install
cp .env.example .env.local     # every value is optional for local work
npm run dev                    # http://localhost:3000
```

With no keys set, everything works: the demos use the scripted engines, leads go to a local SQLite
file (`./data/leads.db`, git-ignored), and `/admin` stays off.

To try the admin locally, set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (a long random string,
e.g. `openssl rand -hex 32`) in `.env.local`, then open `/admin`.

## Quality gates

| Command | What it checks |
|---|---|
| `npm run typecheck` | TypeScript strict |
| `npm run lint` | ESLint (Next + TypeScript rules) |
| `npm run contrast` | WCAG AA for every text/background pair in both themes (reads `src/design/tokens.css`) |
| `npm test` | Unit tests: scoring, schemas, scripted engines, CSV, content integrity |
| `npm run build && npm run test:e2e` | Browser tests: both lead flows, both demos, axe (WCAG 2.2 AA) on 11 pages in both themes, SEO, headers |

CI runs all of them (`.github/workflows/ci.yml`). The e2e run uses a throwaway SQLite file and
test-only admin credentials, so it never touches real data.

## Environment variables

See `.env.example`. Secrets live only in the environment, never in the repo.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, sitemap, Open Graph (e.g. `https://theyellowworks.com`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits with country code. Used for every WhatsApp link. **Build-time**: set before `npm run build`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown in the footer and structured data once set. **Build-time.** |
| `NEXT_PUBLIC_CALENDAR_URL` | Optional booking link on the confirmation screen. **Build-time.** |
| `DATABASE_URL` | Postgres (Neon) URL. Empty means local SQLite. |
| `LEAD_WEBHOOK_URL` | Slack/Teams/Zapier webhook that accepts `{"text": "..."}`. Alerts on every new lead. |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Both required to switch `/admin` on. |
| `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` | Optional. Only used for hero personalisation today. Without them the site uses rules. |
| `PERSONALISE_DAILY_LLM_CAP`, `DEMO_DAILY_CAP` | Daily spending / usage caps. |

## Deploy (Vercel + Neon)

1. Create a Neon Postgres database and copy its connection string.
2. Import the repo into Vercel. Framework preset: Next.js.
3. Set the environment variables above (at least `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
   `DATABASE_URL`, `LEAD_WEBHOOK_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`).
4. Deploy. Tables are created on first use. Check `/api/health`: it should return `status: "ok"`.
5. Submit a test lead, then confirm it appears in `/admin` and in the webhook channel.

**Before launch**, also do these (they are deliberately left as placeholders):

- Replace every `[square bracket]` value: legal entity, address, registration, founders, prices
  and founding-offer terms. They live in `src/content/site.ts` and `src/content/packages.ts`.
  Prices render in brackets until `confirmed: true`.
- Have a lawyer review `/privacy` and `/terms` (`src/content/legal.ts`). They are drafts.
- Replace the in-memory rate limiter (`src/lib/ratelimit.ts`) with Upstash Redis or a Postgres table.
  The in-memory version resets per serverless instance.
- Have native speakers review the Telugu and Hindi strings in `src/lib/demo/i18n.ts`.
- Re-run Lighthouse against the deployed URL (see "Performance" below).

## How it is organised

```
src/app/                 routes (marketing pages, demos, forms, admin, API)
src/content/             typed content with zod schemas: services, industries, packages, FAQs,
                         demo businesses, legal, site facts, i18n dictionary
src/design/tokens.css    the single token file (colour, space, radius, shadow, blur, type, motion)
src/components/ui        component library (every state shown at /styleguide)
src/components/demo      Front Desk and Autopilot demos
src/lib/                 scoring, scripted engines, db, llm, rate limit, seo, logging
prompts/ + src/prompts/  versioned prompts
e2e/                     Playwright specs
```

Adding a service, industry, package or FAQ is a content-file change only. Adding a demo industry
also needs its entry in `src/content/demo-businesses.ts`.

## Data and privacy

- Stored: lead details after the visitor ticks consent, and cookieless funnel events (event name,
  source label, small props). Never stored: IP addresses, demo chat text, hero business text.
- Logs are structured JSON and never contain names, numbers, emails or message text (`src/lib/log.ts`).
- Admin CSV export neutralises spreadsheet formula injection.
- Retention period for leads is a placeholder in the privacy policy. Decide it before launch.

## Security notes

- Headers and CSP are set in `next.config.ts`. Scripts allow `'unsafe-inline'` because Next.js emits
  inline bootstrap scripts and the theme script must run before paint. Per-request nonces would make
  every page dynamic (no static HTML), so that upgrade is a deliberate later trade-off.
- Lead intake: zod validation, honeypot, minimum fill time, idempotency key, per-IP rate limit.
- Admin: HMAC-signed httpOnly cookie, constant-time password check, login rate limit, noindex.

## LLM

`src/lib/llm` is provider-agnostic (Anthropic adapter today). It is server-only and only used for
hero personalisation. Both demos run on scripted engines (`src/lib/demo/scripted.ts`,
`src/lib/autopilot/engine.ts`) that follow the same guardrails the live model will: answer only from
business knowledge, no medical/legal/financial advice, hand over emergencies and complaints, decline
off-topic questions, say when unsure, identify as automated. To go live, add the model call at the
single hook in `src/app/api/demo/chat/route.ts`; the stream format and the client do not change.

## Performance

Measured with Lighthouse 12 (mobile preset, simulated slow 4G and 4x CPU) against a local
production build: Accessibility 100, Best practices 96 to 100, SEO 100 on every page tested;
Performance 80 to 89. Unthrottled, first and largest contentful paint are about 0.4 s. The simulated
score includes fixed network round trips that a CDN-hosted deploy reduces, so measure the deployed
URL before judging the 95 target. The scroll story uses CSS scroll-driven animations and falls back
to a static list where unsupported or when reduced motion is on.

## Brand

See `BRAND.md` for colours, type, logo and motion rules.
