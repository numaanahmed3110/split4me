# split4me

<div align="center">

![split4me](public/logo-with-text.png)

**A free, open-source, privacy-first expense sharing app for friends who split bills — and stay friends.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.2-06B6D4)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0.0-2D3748)](https://www.prisma.io/)
[![tRPC](https://img.shields.io/badge/tRPC-11.18.0-2596BE)](https://trpc.io/)

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8)](https://web.dev/progressive-web-apps/)
[![i18n](https://img.shields.io/badge/i18n-33_languages-FF6B6B)](https://github.com/formatjs/next-intl)

</div>

---

> **"IOU" shouldn't be a four-letter word.**

split4me exists because splitting expenses with friends shouldn't require a spreadsheet, a mediator, or a group chat argument about who bought the snacks three months ago.

---

## Why split4me?

| 🎯 **Purpose-built**            | Designed for friends & family — no enterprise bloat, no "team workspaces," no quarterly reviews                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔒 **Your data, your rules**    | Self-hosted by default. Your financial data lives on _your_ infrastructure. No tracking. No ads. No "we'll sell your data to advertisers" in the fine print |
| 🌍 **Actually global**          | 33 languages (including RTL), any currency, live exchange rates. Your Korean friend in Seoul and your abuela in Buenos Aires both feel at home              |
| 🤖 **AI that actually helps**   | **Receipt scanning, voice entry, auto-categorization** — powered by NVIDIA Nemotron. Opt-in only. No data leaves your server except the API call            |
| 📱 **PWA = installable**        | Add to home screen. Works offline. Feels native. No App Store gatekeepers                                                                                   |
| ⚡ **Modern stack, zero cruft** | Next.js 16, React 19, tRPC, Prisma 7, Tailwind 4. Built for developers who hate configuring build tools                                                     |

---

## Features (The Good Stuff)

### 🤖 AI-Powered Expense Entry (Unique in This Space)

| Feature                 | What It Does                                                            | Why It's Different                                                                             |
| ----------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Receipt Scanning**    | 📸 Photo → structured expense (title, amount, date, category, currency) | Runs on _your_ server → calls NVIDIA Nemotron. No S3 upload. No third-party sees your receipts |
| **Voice Entry**         | 🎤 "I paid 47 bucks for dinner" → expense drafted, ready to confirm     | Deepgram STT + Nemotron reasoning. Hands-free at the restaurant                                |
| **Auto-Categorization** | "Uber to airport" → _Transportation_ without lifting a finger           | Same Nemotron call, zero config. Learns your patterns                                          |

> **Privacy-first AI**: Your receipt image goes to NVIDIA's API and _nowhere else_. Your voice goes to Deepgram. We don't store them. Your server doesn't log them. Opt-in via env vars — disabled by default.

### Core Expense Sharing (Without the Awkwardness)

| Feature                        | What it means for you                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **Shared Groups**              | Create a group → share link/QR → done. No accounts needed for your friends             |
| **Flexible Splitting**         | Evenly? By shares? By percentage? Exact amounts? Saved defaults per group. Yes to all  |
| **Multi-currency**             | Tokyo trip in ¥, Paris dinner in €, rent in $. Live rates via Frankfurter API          |
| **Receipts & Docs**            | Snap a photo, attach a PDF. S3-compatible storage (opt-in). Your receipts, your bucket |
| **Categories that make sense** | Food, Transport, Entertainment, Life, Home, Utilities — organized automatically        |
| **Search that works**          | "Show me all sushi expenses from March" — actually finds them                          |

### Balances: Who Owes Whom (Without the Guilt)

| Feature                | Why it's nice                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **Real-time balances** | Updated the millisecond someone adds an expense                                                    |
| **Smart settlements**  | Algorithm minimizes transactions. "Alice pays Bob $23.50" instead of 7 people venmo-ing each other |
| **Personalized view**  | Everyone sees _their_ "you owe / you're owed" — not the whole group's laundry                      |
| **Mark as paid**       | One tap. History preserved. No "wait did I pay you back?" texts                                    |

### Insights: Pretty Charts for Your Spending Habits

| View                  | What you'll discover                                                      |
| --------------------- | ------------------------------------------------------------------------- |
| **Over time**         | "Wait, we spent _how much_ on coffee last month?"                         |
| **By participant**    | Who's the big spender? (Spoiler: it's usually you)                        |
| **By category**       | Food > Rent > "Miscellaneous" > Therapy                                   |
| **Recurring tracker** | Subscriptions, rent, that gym membership you forgot about                 |
| **Custom ranges**     | All time, this month, last 30 days, this year, or "that one trip to Bali" |

### Collaboration Without the Drama

- **QR codes** — Generate, download, print, stick on the fridge
- **"Who are you?"** — Each device picks "I'm Alex" → personalized view
- **Starred/Archived** — Organize your group list like a civilized human
- **Activity log** — Full audit trail. "Sarah updated the grocery expense" — accountability without accusation
- **Group notes** — Trip details, house rules, "don't forget the deposit is due Friday"

### Data Portability (Because It's _Your_ Data)

| Export          | Use case                                                           |
| --------------- | ------------------------------------------------------------------ |
| **JSON**        | Complete backup, migration, or feeding to your own scripts         |
| **CSV**         | Spreadsheets, tax time, that one friend who loves pivot tables     |
| **PWA offline** | View groups on a plane, in a cabin, at your grandma's with no WiFi |

---

## 🚧 Coming Soon: Group Funds & Budgets (Schema Ready)

The database schema includes a complete **Group Fund system** — tables designed, migrations applied, ready for implementation:

| Entity               | Purpose                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| **GroupFund**        | Top-level fund per group (target amount, status)                                |
| **Budget**           | Named allocations within a fund (e.g., "Food: $500", "Transport: $300")         |
| **FundReserve**      | Ring-fenced amounts (e.g., "Return travel: $2,000" — untouchable until the end) |
| **FundContribution** | Who put in what, when                                                           |

**Planned capabilities:**

- Set trip budget → auto-create budgets per category
- Reserve amounts (return travel, deposits) → excluded from spendable balance
- Real-time ledger: every expense deducts from its budget + updates reserves
- **Smart alerts**: "You're 80% through Food budget" / "Reserve touched — return travel at risk"
- Push notifications via OneSignal when thresholds crossed
- Visual ledger view: budget bars, reserve rings, spend velocity

> **Status**: Database schema ✅ | API routes 🚧 | UI 🚧 | Notifications 🚧  
> Want this faster? [Open an issue](https://github.com/your-org/split4me/issues) or submit a PR — the foundation is solid.

---

## Tech Stack (For the Curious)

| Layer         | Choice                             | Why                                     |
| ------------- | ---------------------------------- | --------------------------------------- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Fast, modern, React 19 ready            |
| **Language**  | TypeScript 6 (strict)              | Catch bugs before they ship             |
| **Styling**   | Tailwind CSS 4 + shadcn/UI         | Utility-first, accessible, customizable |
| **Database**  | PostgreSQL + Prisma 7              | Type-safe ORM, runtime migrations       |
| **API**       | tRPC 11 + TanStack Query v5        | End-to-end types, zero boilerplate      |
| **Auth**      | Clerk                              | Battle-tested, MFA, orgs, great DX      |
| **i18n**      | next-intl 4                        | ICU messages, 33 locales, RTL support   |
| **PWA**       | Workbox + custom SW                | Installable, offline-first              |
| **AI**        | NVIDIA Nemotron + Deepgram         | Vision + reasoning + STT                |
| **Analytics** | Plausible / Console                | Privacy-first, extensible providers     |
| **Testing**   | Playwright (e2e) + Jest (unit)     | Real browser, real confidence           |
| **CI/CD**     | GitHub Actions                     | Typecheck → lint → test → docker        |
| **Container** | Multi-arch (amd64/arm64), non-root | Runs anywhere Docker runs               |

---

## Quick Start (3 minutes)

### Prerequisites

- Node.js ≥ 24, npm ≥ 11
- PostgreSQL 17+ (local or managed)
- Docker (optional but recommended)

### Local Dev

```bash
# 1. Clone
git clone https://github.com/your-org/split4me.git
cd split4me

# 2. Database (or use your own)
./scripts/start-local-db.sh

# 3. Configure
cp .env.example .env
# Add your DATABASE_URL, Clerk keys, BASE_URL...

# 4. Install & migrate
npm install

# 5. 🚀
npm run dev
# → http://localhost:3001
```

### Environment Variables (The Important Ones)

| Variable                            | Required?   | Default                                         | What it does                                 |
| ----------------------------------- | ----------- | ----------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                      | ✅          | —                                               | Postgres connection (via `prisma.config.ts`) |
| `CLERK_SECRET_KEY`                  | ✅          | —                                               | Clerk server auth                            |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅          | —                                               | Clerk client auth                            |
| `BASE_URL`                          | ❌          | `http://localhost:3000`                         | Public URL for metadata, sitemap, actions    |
| `DEFAULT_CURRENCY_CODE`             | ❌          | `USD`                                           | Default currency for new groups              |
| `ENABLE_EXPENSE_DOCUMENTS`          | ❌          | `false`                                         | Enable S3 document uploads                   |
| `ENABLE_RECEIPT_EXTRACT`            | ❌          | `false`                                         | **Enable receipt AI (Nemotron vision)**      |
| `ENABLE_CATEGORY_EXTRACT`           | ❌          | `false`                                         | **Enable auto-categorization**               |
| `NVIDIA_API_KEY`                    | If AI on    | —                                               | Nemotron API key (get at build.nvidia.com)   |
| `NVIDIA_MODEL`                      | ❌          | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | Model for AI features                        |
| `DEEPGRAM_API_KEY`                  | If voice on | —                                               | **Enable voice entry (Deepgram STT)**        |
| `ANALYTICS_PROVIDER`                | ❌          | `none`                                          | `console` or `plausible`                     |
| `ONESIGNAL_APP_ID`                  | ❌          | —                                               | Push notifications (expense alerts)          |
| `ONESIGNAL_REST_API_KEY`            | ❌          | —                                               | OneSignal REST API key                       |

> See `.env.example` for the complete list with comments.

---

## Deployment (Pick Your Poison)

### Docker (Recommended — Zero Surprises)

```bash
npm run build-image
cp container.env.example container.env
# Edit container.env with production values
npm run start-container
# → http://localhost:3000
```

### Docker Compose (Production-Ready)

```yaml
# docker-compose.yml
name: split4me

services:
  app:
    image: ghcr.io/your-org/split4me:latest
    user: '1000:1000'
    ports: ['8080:3000/tcp']
    environment:
      POSTGRES_PRISMA_URL: postgresql://user:pass@db:5432/split4me
      POSTGRES_URL_NON_POOLING: postgresql://user:pass@db:5432/split4me
    volumes: ['./app/cache:/usr/app/.next/cache']
    depends_on: [db]
    networks: [split4me]

  db:
    image: postgres:17.3
    user: '1000:1000'
    environment:
      POSTGRES_USER: split4me
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: split4me
    volumes: ['./db/data:/var/lib/postgresql/data']
    networks: [split4me]

networks:
  split4me:
```

### Vercel (Zero-Config)

1. Import repo → Add env vars (including `DATABASE_URL` from Vercel Postgres/Neon/Supabase)
2. Deploy. Migrations run automatically via `postinstall`.

### Health Checks (For Your Orchestrator)

| Endpoint                                     | Use case                           |
| -------------------------------------------- | ---------------------------------- |
| `GET /api/health` or `/api/health/readiness` | Ready for traffic (app + DB)       |
| `GET /api/health/liveness`                   | Process alive (k8s liveness probe) |

---

## Project Structure (Tour Guide)

```
split4me/
├── .github/workflows/     # CI/CD: typecheck → lint → e2e → docker
├── e2e/                   # Playwright tests (real browser, real DB)
├── messages/              # 33 locale files (ICU syntax, rich text)
├── prisma/
│   ├── schema.prisma      # Your data model (includes Fund/Budget/Reserve)
│   ├── migrations/        # Versioned SQL
│   └── config.ts          # Prisma 7 datasource
├── public/                # Logos, icons, manifest, splash
├── scripts/               # Build, DB, currency data gen
└── src/
    ├── app/               # Next.js App Router
    │   ├── (auth)/        # Sign-in/up (Clerk)
    │   ├── api/           # Health, tRPC, S3, voice
    │   ├── groups/        # All group pages (tabs, stats, balances...)
    │   ├── layout.tsx     # Root: providers, header, footer
    │   ├── page.tsx       # Landing page (you're reading its README)
    │   └── manifest.ts    # PWA manifest
    ├── components/
    │   ├── ui/            # 40+ shadcn/UI components
    │   └── *.tsx          # Feature components (forms, dialogs, QR, etc.)
    ├── lib/
    │   ├── analytics/     # Providers + event definitions
    │   ├── balances.ts    # Settlement algorithms (the smart part)
    │   ├── currency.ts    # Currency data + Frankfurter conversion
    │   ├── nemotron.ts    # NVIDIA AI client (receipt, voice, category)
    │   ├── deepgram.ts    # Speech-to-text client
    │   ├── schemas.ts     # Zod validation (forms, AI output)
    │   ├── notifications.ts # OneSignal push (expense created)
    │   ├── onesignal.ts   # OneSignal REST wrapper
    │   └── utils.ts       # Formatters, helpers, random IDs
    ├── trpc/
    │   ├── init.ts        # Context + protectedProcedure
    │   ├── client.tsx     # React Query + tRPC hooks
    │   └── routers/       # API: groups, categories, drafts, prefs
    ├── hooks/             # Custom React hooks
    └── i18n/              # next-intl config (locale detection, labels)
```

---

## Architecture Bits Worth Knowing

### Type-Safety All the Way Down

```
Database (Prisma) → API (tRPC + Zod) → Client (React Query + TS)
```

Change a field in `schema.prisma` → TypeScript screams at you everywhere it's used.

### Auth Model (Simple by Design)

```
/                    → Public landing (no auth)
/sign-in, /sign-up   → Clerk hosted UI
/groups/*            → Protected by clerkMiddleware → auth.protect()
/api/trpc/*          → Protected by protectedProcedure
```

**Participants don't need accounts.** They click a link. Done.

### Internationalization (Not an Afterthought)

- 33 locales, including Arabic & Hebrew (RTL)
- ICU messages: `{count, plural, one {# expense} other {# expenses}}`
- Rich text in translations: `<strong>`, `<em>`, `<paidFor></paidFor>`
- Deep-merge fallback: missing keys inherit from `en-US`

### PWA & Offline (Actually Works)

- Service worker caches app shell + API responses (stale-while-revalidate)
- Manifest with maskable icons, splash screens, shortcuts
- Background sync for pending mutations (experimental but functional)

### Analytics (Privacy-First, Not Privacy-Theater)

- **Disabled by default** — no scripts loaded until you configure one
- **Anonymized paths**: `/groups/abc123/expenses` → `/groups/[groupId]/expenses`
- **No IDs ever sent** — compile-time guarantee via Zod event schemas
- **Extensible**: Console (dev), Plausible (prod), or your own provider

---

## Development (Daily Driver Commands)

```bash
# Quality gates (run before PR)
npm run check-types    # TypeScript strict mode
npm run lint           # ESLint (Next.js config)
npm run check-formatting  # Prettier

# Testing
npm run test           # Jest + React Testing Library
npm run e2e            # Full stack in Docker (Playwright)
npm run e2e:up         # Start test stack
npm run e2e:test -- --ui
npm run e2e:report     # HTML report
npm run e2e:down       # Teardown

# Database
npx prisma migrate dev --name descriptive_name
npx prisma studio      # Visual DB browser

# Utilities
npm run generate-currency-data  # Refresh currency list + rates
```

### Adding a Locale (5 minutes)

1. `cp messages/en-US.json messages/xx-YY.json`
2. Translate values (keep keys identical)
3. Add to `src/i18n/request.ts` `localeLabels`
4. `npm run check-types` → profit

### Adding an Analytics Provider

1. Copy `src/lib/analytics/providers/console.tsx`
2. Implement `AnalyticsProvider` interface
3. Register in `provider-ids.ts`, `registry.ts`, `config.ts`
4. `npm run check-types` validates the wiring

---

## Contributing (We ❤️ PRs)

**Before you open that PR:**

- [ ] `npm run check-types` — clean
- [ ] `npm run lint` — clean
- [ ] `npm run check-formatting` — clean
- [ ] Tests pass (`npm run test` + `npm run e2e` if UI)
- [ ] Translations updated for user-facing strings
- [ ] Docs updated if behavior changed

### Good First Issues

Look for `good first issue` label on GitHub — we tag them with 🎯

**High-impact areas:**

- Budget/Fund/Reserve API + UI (schema exists, needs routes + components)
- Budget threshold notifications (OneSignal integration ready)
- Multi-language receipt OCR improvement
- React Native app (Expo + same tRPC backend)

### Reporting Bugs

Help us help you:

- Clear title + steps to reproduce
- Expected vs actual behavior
- Environment (OS, browser, Docker vs local)
- Screenshots/logs if relevant

---

## Roadmap (Dreams & Plans)

- [ ] **Group Funds & Budgets** — Ledger view, reserves, threshold alerts (schema ✅)
- [ ] **Splitwise import** — CSV or API, one-click migration
- [ ] **Push notifications** — OneSignal for budget alerts, expense mentions
- [ ] **Recurring expense editing** — Modify the series, not just one
- [ ] **Multi-language receipt OCR** — Beyond English receipts
- [ ] **React Native app** — Expo, same tRPC backend, same types

---

## License

MIT — see [LICENSE](./LICENSE).

Copyright (c) original author and the split4me contributors.

---

<div align="center">

**Built with ☕, 🌮, and the belief that money shouldn't ruin friendships.**

_split4me — because "you got this one, I'll get the next" only works if someone remembers._

[🐛 Report a Bug](https://github.com/your-org/split4me/issues) · [✨ Request Feature](https://github.com/your-org/split4me/issues) · [💬 Discussions](https://github.com/your-org/split4me/discussions)

</div>
