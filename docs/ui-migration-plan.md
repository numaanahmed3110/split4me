# UI Migration Plan — split4me

> **Goal:** Migrate the current dark/emerald shadcn-based UI to the warm, pastel, rounded design system defined in the reference screens (onboarding, dashboard, split detail).

---

## 1. Design Philosophy Analysis — Reference vs Current

| Dimension | Current (split4me) | Reference Target |
|---|---|---|
| **Font** | System / rounded stack via Tailwind | **Poppins** (400, 500, 600, 700, 800) |
| **Background** | `bg-slate-50` (light) / dark mode | **`#EBEBEB`** canvas, white cards |
| **Primary Accent** | Emerald (`#047857`, `hsl(163,94%,24%)`) | **Pastel Yellow `#FDECAD`**, Purple `#D8CEFA`, Teal `#E0F4F5` |
| **Dark Card** | Standard shadcn card | **`#1D1C22`** (deep charcoal) |
| **Text Color** | `foreground` (`hsl(240,10%,3.9%)`) | **`#1C1C1E`** (soft black), grey `#9CA3AF` |
| **Border Radius** | `0.5rem` (8px) default | **24px–44px** (extra-large, pill shapes) |
| **Card Style** | Flat shadcn Card | Thick cards with deep shadows, stacked overlaps |
| **Buttons** | Standard shadcn (small radius) | **Pill-shaped** (`border-radius: 100px`), large padding |
| **Shadows** | Minimal | `0 15px 35px rgba(0,0,0,0.08)` (prominent) |
| **Color System** | HSL CSS vars (shadcn) | Direct hex palette + semantic named colors |
| **Dark Mode** | Supported (class toggle) | **Light only** for now (reference is all light) |
| **Layout** | Full-width with max-width container | **PWA/Mobile:** Phone-frame style (375px cards), native-app feel. **Web:** Desktop layout — sticky top nav, max-width 1180px container, sidebar app shell for in-app screens, multi-column grids. Same tokens. |

---

## 2. Screen-by-Screen Mapping

### Screen 1 → Landing / Onboarding Page (`/`)

| Element | Current | Reference |
|---|---|---|
| **Header** | Fixed nav with logo, language, theme toggle, user button | No persistent header — full-bleed hero |
| **Hero** | Text "Share Expenses with Friends & Family" + CTA | Split: top 52% is visual mockup zone, bottom is text + buttons |
| **Visual** | None (just text) | Floating 3D-transformed phone mockups with stacked cards (yellow + purple) |
| **Title** | Single-weight heading | Mixed weights: "Set The Bill" (semibold) + "With" (regular) + "Your Friends" (bold) |
| **Subtitle** | Plain text | Grey `#9CA3AF`, 14px |
| **Pagination** | None | 3 dots (active dark, inactive grey) |
| **CTA** | Single "Go to groups" button | Two buttons: Skip (outline, pill) + Sign Up (purple `#D8CEFA`, pill) |

**Files to modify:**
- `src/app/page.tsx`
- Create `src/components/landing/` folder with sub-components

---

### Screen 2 → Groups Dashboard (`/groups`)

| Element | Current | Reference |
|---|---|---|
| **Greeting** | None | "Hello Ganteng" (12px, grey) |
| **Title** | "My groups" (h1, bold, 2xl) | "Good Morning, Don't Forget To Have Breakfast!" (24px, mixed weights) |
| **Balance Card** | shadcn `Card` with title/description/list | **Yellow `#FDECAD` card**, 32px radius, shows "Total Balance" with large amount, Deposit/Withdraw buttons |
| **Group List** | Grid of `RecentGroupListCard` | Replaced by horizontal scrolling "Billing" section with colored cards |
| **Billing Cards** | None | Dark (`#1D1C22`) and Teal (`#E0F4F5`) cards with bill name, split info, amount, Pay/Payed button |
| **Tabs** | shadcn `Tabs` (Expenses, Balances, etc.) | Styled as pill tabs: "Near By" (active, white bg, shadow) / "Recent" / "History" |
| **FAB** | "Create" button in header | "Add Split Billing" full-width purple pill at bottom |

**Files to modify:**
- `src/app/groups/page.tsx`
- `src/app/groups/recent-group-list.tsx`
- `src/app/groups/global-balance-card.tsx`
- `src/app/groups/recent-group-list-card.tsx`
- `src/app/groups/layout.tsx`

---

### Screen 3 → Group Detail / Split Bill (`/groups/[groupId]/balances`)

| Element | Current | Reference |
|---|---|---|
| **Nav** | Back arrow + group name + tabs | Back arrow (←) + centered title "Split The Bill" |
| **Balance Summary** | shadcn Card with BalancesList | **Stacked cards**: Yellow top card ("My Balance" + amount) overlapping Purple bottom card ("Total Bill" + amount + participant avatars + "Split Now" button) |
| **Participants** | Listed as text | **Avatar emojis** in overlapping circles with + add button |
| **Nearby Friends** | None | 3-column grid of friend cards (teal, purple-light, yellow backgrounds) with avatars and + buttons |
| **Detail Card** | None | `#FAFAFA` card with total bill breakdown per participant |

**Files to modify:**
- `src/app/groups/[groupId]/balances/balances-and-reimbursements.tsx`
- `src/app/groups/[groupId]/balances-list.tsx`
- `src/app/groups/[groupId]/reimbursement-list.tsx`
- `src/app/groups/[groupId]/group-header.tsx`
- `src/app/groups/[groupId]/group-tabs.tsx`
- Create `src/app/groups/[groupId]/balances/split-detail-card.tsx`

---

## 3. Global Design Token Changes

### `src/app/globals.css`

Replace the entire `@layer base` block:

```css
@import 'tailwindcss';
@import '@clerk/ui/themes/shadcn.css';
@config '../../tailwind.config.js';

@layer base {
  :root {
    /* === REFERENCE PALETTE === */
    --background: 45 10% 94%;          /* #EBEBEB canvas */
    --foreground: 0 0% 11%;            /* #1C1C1E */
    --card: 0 0% 100%;                 /* #FFFFFF */
    --card-foreground: 0 0% 11%;       /* #1C1C1E */
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 11%;
    --primary: 45 88% 82%;             /* #FDECAD yellow */
    --primary-foreground: 0 0% 11%;
    --secondary: 255 57% 91%;          /* #D8CEFA purple */
    --secondary-foreground: 0 0% 11%;
    --muted: 0 0% 96%;
    --muted-foreground: 220 9% 46%;    /* #9CA3AF */
    --accent: 182 40% 92%;             /* #E0F4F5 teal */
    --accent-foreground: 0 0% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 45 88% 82%;
    --radius: 1rem;                    /* Bumped from 0.5rem */

    /* Semantic tokens for the new palette */
    --yellow: #FDECAD;
    --yellow-dark: #E6D799;
    --purple: #D8CEFA;
    --purple-light: #E8E2FC;
    --teal: #E0F4F5;
    --teal-dark: #CDE6E8;
    --dark-card: #1D1C22;
  }
}
```

### `tailwind.config.js` additions

```js
theme: {
  extend: {
    colors: {
      // Add reference palette as Tailwind utilities
      'ref-yellow': '#FDECAD',
      'ref-yellow-dark': '#E6D799',
      'ref-purple': '#D8CEFA',
      'ref-purple-light': '#E8E2FC',
      'ref-teal': '#E0F4F5',
      'ref-teal-dark': '#CDE6E8',
      'ref-dark-card': '#1D1C22',
      'ref-canvas': '#EBEBEB',
      'ref-text': '#1C1C1E',
      'ref-text-grey': '#9CA3AF',
    },
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
    },
    borderRadius: {
      'xl': '24px',
      '2xl': '28px',
      '3xl': '32px',
      '4xl': '40px',
      'pill': '100px',
    },
    boxShadow: {
      'card': '0 15px 35px rgba(0,0,0,0.08)',
      'card-sm': '0 4px 12px rgba(0,0,0,0.06)',
      'tab': '0 4px 12px rgba(0,0,0,0.06)',
    },
  },
},
```

---

## 4. Component Migration Plan

### Phase 1: Foundation (Week 1)

| # | Task | Files | Effort |
|---|---|---|---|
| 1.1 | Add Google Fonts import for Poppins | `src/app/layout.tsx` (add `<link>` or use `@import` in globals.css) | S |
| 1.2 | Update CSS variables and Tailwind config | `globals.css`, `tailwind.config.js` | S |
| 1.3 | Create shared design tokens file | `src/lib/design-tokens.ts` (export hex values, spacing, radii) | S |
| 1.4 | Update body font-family to Poppins globally | `globals.css` | S |
| 1.5 | Create pill-button variant in Button component | `src/components/ui/button.tsx` (add `variant: 'pill'`) | M |
| 1.6 | Create large-radius Card variant | `src/components/ui/card.tsx` (add props for 28px/32px radius) | M |

### Phase 2: Navigation & Layout (Week 2)

| # | Task | Files | Effort |
|---|---|---|---|
| 2.1 | Redesign header/nav bar | `layout.tsx` `<Content>` component | M |
| 2.2 | Remove sticky header from groups layout | `src/app/groups/layout.tsx` | S |
| 2.3 | Add rounded phone-frame container option | New `src/components/phone-frame.tsx` | M |
| 2.4 | Update footer styling | `layout.tsx` footer section | S |

### Phase 3: Landing Page (Week 2-3)

| # | Task | Files | Effort |
|---|---|---|---|
| 3.1 | Create hero section with gradient background | New `src/components/landing/hero-section.tsx` | L |
| 3.2 | Build floating mockup cards with 3D transforms | New `src/components/landing/floating-mockups.tsx` | L |
| 3.3 | Redesign title with mixed font weights | `src/app/page.tsx` | M |
| 3.4 | Add pagination dots component | New `src/components/ui/pagination-dots.tsx` | S |
| 3.5 | Create Skip + Sign Up button pair | `src/app/page.tsx` | S |

### Phase 4: Groups Dashboard (Week 3-4)

| # | Task | Files | Effort |
|---|---|---|---|
| 4.1 | Redesign GlobalBalanceCard to yellow card | `src/app/groups/global-balance-card.tsx` | L |
| 4.2 | Create horizontal scrolling billing cards | New `src/app/groups/billing-scroll.tsx` | L |
| 4.3 | Create dark billing card component | New `src/app/groups/billing-card.tsx` | M |
| 4.4 | Create teal billing card component | (same file, variant prop) | S |
| 4.5 | Redesign tab bar as pill-style tabs | `src/app/groups/[groupId]/group-tabs.tsx` | M |
| 4.6 | Add greeting + title section | `src/app/groups/page.tsx` | S |
| 4.7 | Create full-width "Add Split Billing" button | `src/app/groups/page.tsx` | S |
| 4.8 | Redesign RecentGroupListCard | `src/app/groups/recent-group-list-card.tsx` | L |

### Phase 5: Group Detail / Split Bill (Week 4-5)

| # | Task | Files | Effort |
|---|---|---|---|
| 5.1 | Create stacked card layout (yellow overlapping purple) | New `src/app/groups/[groupId]/balances/split-summary-card.tsx` | L |
| 5.2 | Add emoji avatar circles with overlap effect | New `src/components/ui/avatar-group.tsx` | M |
| 5.3 | Create nearby friends grid | New `src/app/groups/[groupId]/balances/nearby-friends.tsx` | L |
| 5.4 | Create detail breakdown card | New `src/app/groups/[groupId]/balances/detail-card.tsx` | M |
| 5.5 | Update group header with centered nav | `src/app/groups/[groupId]/group-header.tsx` | M |
| 5.6 | Restyle balances page | `balances-and-reimbursements.tsx` | L |

### Phase 6: Expense Components (Week 5-6)

| # | Task | Files | Effort |
|---|---|---|---|
| 6.1 | Restyle expense cards with new colors | `src/app/groups/[groupId]/expenses/expense-card.tsx` | M |
| 6.2 | Update expense form styling | `src/app/groups/[groupId]/expenses/expense-form.tsx` | L |
| 6.3 | Update expense list layout | `src/app/groups/[groupId]/expenses/expense-list.tsx` | M |

### Phase 7: Auth Pages (Week 6)

| # | Task | Files | Effort |
|---|---|---|---|
| 7.1 | Style Clerk SignIn component wrapper | `src/app/sign-in/[[...sign-in]]/page.tsx` | M |
| 7.2 | Style Clerk SignUp component wrapper | `src/app/sign-up/[[...sign-up]]/page.tsx` | M |
| 7.3 | Update Clerk theme variables for new palette | `layout.tsx` `clerkVariables` | S |

### Phase 8: Stats, Activity, Info Pages (Week 7)

| # | Task | Files | Effort |
|---|---|---|---|
| 8.1 | Update stats page with new card styles | `src/app/groups/[groupId]/stats/` | L |
| 8.2 | Update activity page | `src/app/groups/[groupId]/activity/` | M |
| 8.3 | Update information page | `src/app/groups/[groupId]/information/` | M |
| 8.4 | Update create/edit group forms | `src/app/groups/create/`, `edit/` | M |

---

## 5. Specific Component Specs

### 5.1 Yellow Balance Card
```tsx
// bg-ref-yellow, rounded-4xl (40px), p-6, shadow-card
// Top: "My Balance" label + ••• icon
// Middle: "Total Balance" label (12px grey) + amount (32px bold)
// Bottom: Two pill buttons — Deposit (dark bg) + Withdraw (yellow-dark bg)
```

### 5.2 Stacked Cards (Screen 3)
```tsx
// Container: relative
// Top card: bg-ref-yellow, rounded-3xl (32px), z-2
//   - "My Balance" + amount
// Bottom card: bg-ref-purple, rounded-3xl, mt--6 (overlap), z-1, pt-12
//   - "Total Bill" + amount
//   - "Split With" label
//   - Avatar group (overlapping circles)
//   - "Split Now" pill button (dark bg)
```

### 5.3 Billing Cards (Horizontal Scroll)
```tsx
// Container: flex overflow-x-auto gap-4
// Card: min-w-[155px], rounded-2xl (24px), p-5
// Variant dark: bg-ref-dark-card, text-white
// Variant teal: bg-ref-teal, text-ref-text
// Content: header (name + icon), description, price, pay button
```

### 5.4 Pill Buttons
```tsx
// All primary buttons: rounded-pill (100px), font-semibold
// Height: ~52px (py-[18px]), font-size: 14-15px
// Variants:
//   - primary: bg-ref-purple, text-ref-text
//   - dark: bg-ref-dark-card, text-white
//   - outline: border border-gray-200, text-ref-text
//   - yellow-dark: bg-ref-yellow-dark, text-ref-text
```

### 5.5 Avatar Overlap Group
```tsx
// Each avatar: 36x36px, rounded-full, border-2px solid bg color
// Overlap: margin-left: -12px (except first)
// Add button: dashed border circle, "+" icon
```

---

## 6. Migration Strategy

### Approach: Incremental, Feature-Flag Based

1. **Create a `UI_V2` feature flag** (env variable or localStorage)
2. **Wrap old/new UI** in conditional rendering
3. **Migrate one screen at a time**, starting with the most visible
4. **Keep dark mode functional** but the reference is light-only; dark mode can be revisited later

### Recommended Order
1. **Design tokens** (globals.css + tailwind) — instant visual change
2. **Landing page** — first impression, low risk
3. **Groups dashboard** — most visited screen
4. **Group detail / balances** — core functionality
5. **Auth pages** — low complexity
6. **Stats/activity/info** — lower priority pages
7. **Forms** — last, functional risk

### Risk Mitigation
- **Clerk theming**: The `clerkVariables` in layout.tsx wrap HSL values; changing the palette requires re-wrapping all tokens
- **Dark mode**: The reference has no dark mode; consider removing dark toggle or mapping new palette to dark variants
- **Responsive**: Reference is phone-sized (350px); ensure new design scales to desktop (current `max-w-screen-md` container)
- **i18n**: All text strings are currently translated; new UI copy must go through the i18n system
- **Testing**: Run `npm run test` and `npm run e2e` after each phase

---

## 7. Effort Summary

| Phase | Screens | Effort (days) |
|---|---|---|
| Phase 1: Foundation | CSS/Tailwind/Components | 2-3 |
| Phase 2: Navigation | Header/Footer/Layout | 2 |
| Phase 3: Landing | Onboarding hero | 3-4 |
| Phase 4: Dashboard | Groups list + balance | 4-5 |
| Phase 5: Split Detail | Balances + stacked cards | 4-5 |
| Phase 6: Expenses | Cards + forms | 3-4 |
| Phase 7: Auth | Sign-in/up wrappers | 1-2 |
| Phase 8: Remaining | Stats/Activity/Info | 3-4 |
| **Total** | | **22-29 days** |

---

## 8. File Reference

### Key Files by Priority

**Foundation:**
- `src/app/globals.css` — Design tokens
- `tailwind.config.js` — Tailwind extensions
- `src/app/layout.tsx` — Root layout, header, footer, Clerk config

**Groups:**
- `src/app/groups/page.tsx` — Groups list page
- `src/app/groups/layout.tsx` — Groups layout wrapper
- `src/app/groups/global-balance-card.tsx` — Balance summary card
- `src/app/groups/recent-group-list.tsx` — Group list logic
- `src/app/groups/recent-group-list-card.tsx` — Individual group card

**Group Detail:**
- `src/app/groups/[groupId]/group-header.tsx` — Header + tabs
- `src/app/groups/[groupId]/group-tabs.tsx` — Tab navigation
- `src/app/groups/[groupId]/balances/balances-and-reimbursements.tsx` — Balances page
- `src/app/groups/[groupId]/balances-list.tsx` — Balances list
- `src/app/groups/[groupId]/reimbursement-list.tsx` — Reimbursements

**Expenses:**
- `src/app/groups/[groupId]/expenses/expense-card.tsx` — Expense item
- `src/app/groups/[groupId]/expenses/expense-form.tsx` — Create/edit form
- `src/app/groups/[groupId]/expenses/expense-list.tsx` — Expense list

**Auth:**
- `src/app/sign-in/[[...sign-in]]/page.tsx` — Sign-in page
- `src/app/sign-up/[[...sign-up]]/page.tsx` — Sign-up page

**UI Components:**
- `src/components/ui/button.tsx` — Button variants
- `src/components/ui/card.tsx` — Card variants
- `src/components/ui/tabs.tsx` — Tabs component

---

## 9. Web-View Mock Screens (Desktop)

> The reference screens in §2 are phone-frame (PWA/mobile) mocks. This section adds the **desktop / web-view** counterparts, built with the **same design philosophy** (Poppins, pastel yellow/purple/teal, large radii, pill buttons, stacked cards, soft shadows) but laid out for a desktop browser. The web landing page is a **completely new design** informed by modern SaaS landing-page best practices (sticky nav, hero with floating mockup cards, logo bar, feature grid, "how it works" steps, testimonials, dark CTA band, footer).

### 9.1 Mock files produced

| File | Contents |
|---|---|
| `docs/ui-preview-web.html` | **All-in-one web preview** — 22 web screens with a sticky section nav |
| `docs/ui-mocks/web/s01-landing.html` … `s22-dark-mode.html` | **Per-screen web files** (self-contained HTML+CSS), adjacent naming `sNN-<slug>` |
| `docs/ui-preview.html` | All-in-one **PWA/mobile** preview (pre-existing) |
| `docs/ui-mocks/pwa/s01-landing.html` … `s22-dark-mode.html` | **Per-screen PWA files** (self-contained) |
| `docs/gen-web.cjs` | Generator script for the web mocks (design system + 22 screens) |
| `docs/gen-pwa.cjs` | Generator script that splits `ui-preview.html` into per-screen PWA files |

### 9.2 Web design system (reused tokens)

- **Canvas:** warm off-white `#F4F1EA`; **cards:** `#FFFFFF`; **text:** `#1C1C1E`; **muted:** `#8A8A8E`.
- **Accents:** yellow `#FDECAD`, purple `#D8CEFA`, teal `#E0F4F5`; **dark surface:** `#1D1C22`.
- **Radii:** `--r: 28px`, `--r-lg: 36px`, `--pill: 100px`.
- **Shadows:** `--shadow: 0 24px 60px rgba(0,0,0,0.07)`, `--shadow-sm: 0 8px 24px rgba(0,0,0,0.05)`.
- **Layout primitives:** `.wnav` sticky top nav (logo + links + CTA), `.wrap` max-width 1180px, `.btn` pill button system (`btn-dark`, `btn-primary`=purple, `btn-yellow`, `btn-teal`, `btn-outline`), `.app` sidebar app shell (`.sidebar` + `.main` + `.topbar`) for in-app screens 7–22, `.dark-app` scoped dark theme for Screen 22.
- **Responsive:** collapses to single column and hides sidebar/links under 980px.

### 9.3 Web screen → route mapping

| # | Web file | Title | Corresponding app route / component |
|---|---|---|---|
| 1 | `s01-landing.html` | Landing (new design) | `src/app/page.tsx` + `src/components/landing/*` |
| 2 | `s02-onboard-voice.html` | AI Voice Expense | Feature spotlight (marketing) |
| 3 | `s03-onboard-ledger.html` | Shared Ledger | Feature spotlight (marketing) |
| 4 | `s04-onboard-split.html` | Smart Split & Analytics | Feature spotlight (marketing) |
| 5 | `s05-signin.html` | Sign In | `src/app/sign-in/[[...sign-in]]/page.tsx` |
| 6 | `s06-signup.html` | Sign Up | `src/app/sign-up/[[...sign-up]]/page.tsx` |
| 7 | `s07-dashboard.html` | Groups Dashboard | `src/app/groups/page.tsx` (web shell) |
| 8 | `s08-split-detail.html` | Split Bill Detail | `src/app/groups/[groupId]/balances/*` |
| 9 | `s09-expenses.html` | Expenses List | `src/app/groups/[groupId]/expenses/*` |
| 10 | `s10-create-expense.html` | Create Expense | `.../expenses/expense-form.tsx` |
| 11 | `s11-balances.html` | Balances & Reimbursements | `.../balances/balances-and-reimbursements.tsx` |
| 12 | `s12-stats.html` | Statistics | `.../stats/*` |
| 13 | `s13-group-info.html` | Group Information | `.../information/*` |
| 14 | `s14-activity.html` | Activity Log | `.../activity/*` |
| 15 | `s15-ocr-preview.html` | OCR Receipt Preview | `.../create-from-receipt/*` |
| 16 | `s16-split-now.html` | Split Now (sliders) | `.../expenses/split-now` |
| 17 | `s17-create-group.html` | Create Group | `src/app/groups/create/*` |
| 18 | `s18-split-modes.html` | Split Modes | expense form split selector |
| 19 | `s19-receipt-scan.html` | Receipt Scan & AI Draft | `.../create-from-receipt/*` |
| 20 | `s20-group-settings.html` | Group Settings | `.../edit/*` + settings |
| 21 | `s21-empty-states.html` | Empty States | shared empty-state components |
| 22 | `s22-dark-mode.html` | Dark Mode | `.dark-app` scoped theme |

### 9.4 How to use these mocks

1. Open `docs/ui-preview-web.html` in a browser to scroll all 22 web screens.
2. Open any `docs/ui-mocks/web/sNN-*.html` for an isolated, referenceable screen (e.g. hand to the implementer recreating `src/app/groups/page.tsx`).
3. The PWA equivalents live under `docs/ui-mocks/pwa/` for the mobile layout.
4. To tweak the system, edit `docs/gen-web.cjs` (`WEB_CSS` / `SCREENS`) and re-run `node docs/gen-web.cjs`.

> **Note:** Both `ui-preview-web.html` and the per-screen files are regenerated by the scripts; edit the scripts, not the generated HTML, to keep them in sync.
