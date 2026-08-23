# Spliit → PWA Mock Migration Plan (canonical)

> **Goal:** migrate every feature of the current web app (`src/app/**`) into the PWA mock-design
> language (`docs/ui-mocks/pwa/*`, philosophy in §4). Nothing gets dropped; gaps get new screens.
> Companion docs: `docs/app-flow.md` (flow truth), `docs/ui-migration-plan.md` §9 (web system).

## 1. Real-app feature inventory (from source routes/components)

| Feature | Source | Status in mocks |
|---|---|---|
| Landing / marketing | `page.tsx`, `landing/*` | ⚠️ web-only placeholder; shared responsive landing pending reference |
| Sign in / Sign up | `sign-in/[[...]]`, `sign-up/[[...]]` (Clerk) | ✅ pwa s05, s06 |
| Groups home: global balance card, recent groups, add-by-URL | `groups/page.tsx`, `global-balance-card`, `recent-group-list*`, `add-group-by-url-button` | ✅ pwa s07 (balance+recent groups) · ➖ add-by-URL not shown |
| Create group (name/currency/participants) | `groups/create/create-group.tsx` | ✅ pwa s17 |
| Join via link/QR | `add-group-by-url-button` | ⚠️ mentioned in s07/s21 copy only |
| Group header/tabs/share/save-recent | `[groupId]/group-header`, `group-tabs`, `share-button`, `save-recent-group` | ➖ share dialog missing; tabs ✅ s09/s11/s12 |
| Expenses list + cards + active-user balance | `expenses/expense-list/card`, `active-user-*` | ✅ pwa s09 |
| Create/edit expense: amount, category icon, date, paid-by, split mode (evenly/shares/%/amount), participants | `expense-form.tsx`, `create-expense-form`, `edit-expense-form`, `category-icon` | ✅ s10 create · ✅ s18 modes · ➖ edit reuses create (fine) |
| Documents/attachments per expense | `documents-count` | ❌ no mock |
| Voice expense ("say what you spent") | `voice-expense-button`, `api/voice/transcribe`, `api/voice/parse` | ❌ capture→transcript→confirm screen missing |
| Receipt OCR → draft review | `create-from-receipt-button` | ✅ s16 scan+draft, ✅ s15 OCR receipt preview/pay |
| Balances & reimbursements (+settle) | `balances/balances-and-reimbursements`, `reimbursement-list` | ✅ s08/s11 |
| Group fund | `fund/page.*` | ❌ no mock |
| Export CSV/JSON | `expenses/export/{csv,json}`, `export-button` | ❌ no mock |
| Share group | `share-button` | ❌ no mock |
| Stats: range selector, totals (group/your-share/your-spending), over-time bars, category breakdown, participant spending, **recurring spending**, drill-in dialog | `stats/*` (10 files) | ⚠️ s12 covers ranges/totals/bars/categories; ❌ participant spending, ❌ recurring, ❌ drill-in |
| Activity log | `activity/*` | ✅ s14 |
| Group information + members | `information/*` | ✅ s13 |
| Edit group / settings | `edit/*` | ✅ s17-style (pwa s20) |
| Empty states | various | ✅ s21 |
| Dark theme | globals | ✅ s22 |

## 2. Gap screens — **BUILT & VERIFIED ✅ (s25–s32 shipped)**

| New # | Slug | Covers | Spec sketch |
|---|---|---|---|
| s25 | `voice-expense` | Voice capture → transcript chips → parsed draft → Save | Mic orb (yellow ring pulse), live transcript card, parsed fields as editable chips, Confirm btn-dark |
| s26 | `group-fund` | Fund balance, contribute/spend entries, members' contributions | Balance hero card (teal), entry list rows +₹/−$, Contribute btn-dark, per-member contribution bars |
| s27 | `share-group` | Share via link/QR | QR card centered, copy-link field, "Add by URL" input variant, Send-to buttons row |
| s28 | `expense-documents` | Attachments gallery + add | Doc tiles (jpg/pdf icons), + Add tile dashed, count chip in expense header |
| s29 | `stats-participants` | Participant spending ranking + drill-in | Ranked avatar rows w/ horizontal bars, tap → dialog listing their expenses |
| s30 | `stats-recurring` | Recurring spending | Calendar-tap motif, recurring items list w/ cycle chips (monthly/yearly), next-due column |
| s31 | `export-sheet` | CSV/JSON export bottom sheet | Two option rows w/ icons + size hint, Cancel ghost |
| s32 | `join-group` | Join by URL/QR entry | URL paste field, QR scan button, preview-of-group card before join |

## 3. Build order (phases)

1. **Phase A – core parity:** s25 voice, s32 join, s27 share (high-traffic flows).
2. **Phase B – money extras:** s26 fund, s31 export, s28 documents.
3. **Phase C – stats depth:** s29 participants, s30 recurring.
4. Each phase: build → headless verify (0 overflow, WCAG AA, content asserts) → regenerate all previews → commit.

## 4. Design law (unchangeable)

Poppins · kinari canvas `#F6F2E9`-family pastels: yellow `#FDECAD/#E6D799`, purple `#D8CEFA/#E8E2FC`,
teal `#E0F4F5/#CDE6E8`; dark card `#1D1C22`; text `#1C1C1E`/grey `#9CA3AF`; semantic green `#16A34A`
red `#DC2626`; radii 16–28px, pill buttons, stacked white cards, soft shadows, emoji iconography,
phone frame + screen-label wrapper, bottom tab bar (Home·Stats·＋·Alerts·Profile).

## 5. Definition of done (every screen)

Self-contained file via `gen-pwa.cjs` · palette-pure (audit) · 0 horizontal overflow · WCAG AA text ·
content mirrors real feature's fields verbatim · registered in `ui-preview.html` nav + this table.
