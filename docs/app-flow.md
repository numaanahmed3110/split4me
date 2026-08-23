# split4me — Application Flow & Screen Inventory (Canonical)

> **Purpose:** hand this file to any designer/agent so it has complete inner knowledge of how the
> product flows across surfaces, which mock file implements each step, and what rules must not be
> broken. Mock sources live in `docs/`; regenerate, never hand-edit generated HTML.

---

## 1. Surfaces (three, one product)

| Surface | What the user sees | Design language |
|---|---|---|
| **Web app** | Desktop browser after sign-in at the site | Standard web designs: sidebar shell `.app`, multi-column grids (`docs/ui-mocks/web/*`) |
| **Mobile browser** | Same site opened on a phone, *not installed* | Responsive mobile web; entry point into the PWA install prompt |
| **Installed PWA** | Launched from home-screen icon, full-screen, offline-capable | Phone-frame designs: bottom tab bar, stacked cards (`docs/ui-mocks/pwa/*`) |

The PWA is **not a different product** — it is the same app wrapped after installation. Designs are
identical in content and tokens; only format differs.

## 2. Master flow

```
                        ┌──────────────────────────────┐
                        │  LANDING  (shared, responsive)│  describes the product
                        └──────────────┬───────────────┘
                                       │  CTA: Get started / Sign in
                                       ▼
                        ┌──────────────────────────────┐
                        │  SIGN IN / SIGN UP (shared)   │  Google or email
                        └──────────────┬───────────────┘
              desktop browser ─────────┴───────── mobile browser
                     ▼                           ▼
        ┌──────────────────────┐      ┌───────────────────────────────┐
        │ WEB APP (desktop)    │      │ INSTALL PROMPT (s23)          │
        │ Dashboard → …        │      │ "Add split4me to Home screen?"│
        └──────────────────────┘      └──────────────┬────────────────┘
                                              Accept ▼            Decline ──► use as mobile web
                                ┌───────────────────────────────┐
                                │ ONBOARDING ×3 (s02–s04)       │  FIRST PWA LAUNCH ONLY
                                │ Voice · Shared Ledger · Split │
                                └──────────────┬────────────────┘
                                               ▼
                                ┌───────────────────────────────┐
                                │ NOTIFICATIONS PROMPT (s24)    │  "Enable notifications?"
                                └──────────────┬────────────────┘
                                        Allow ▼ / Later
                                ┌───────────────────────────────┐
                                │ PWA APP (mobile designs)      │
                                │ Dashboard → … (bottom tabs)   │
                                └───────────────────────────────┘
```

## 3. Step-by-step with mock references

| # | Step | Condition | Surface | Mock (PWA) | Mock (Web) | Next |
|---|---|---|---|---|---|---|
| 1 | Land on marketing page | always | any browser | `ui-mocks/pwa/s01-landing.html` *(mobile render of the same landing)* | `ui-mocks/web/s01-landing.html` *(canonical; new reference design pending)* | 2 |
| 2 | Authenticate | always | any browser | `pwa/s05-signin`, `pwa/s06-signup` | `web/s02-signin`, `web/s03-signup` | 3 |
| 3a | Enter web app | desktop browser | Web | — | `web/s04-dashboard` then `web/s05…s18`, dark `web/s19` | stay |
| 3b | Install prompt | mobile browser, not installed, signed-in, prompt not permanently dismissed | Mobile | `pwa/s23-pwa-install` | — | 4 (accept) / mobile-web app (decline) |
| 4 | Onboarding | **first launch inside installed PWA only**; skipped on every later open; never shown on desktop | PWA | `pwa/s02-onboard-voice`, `s03-onboard-ledger`, `s04-onboard-split` | — (must not appear) | 5 |
| 5 | Notifications prompt | immediately after onboarding completes; once; re-ask only from Settings | PWA | `pwa/s24-notification-permission` | — | 6 |
| 6 | App home | returning users land here directly | PWA / Web | `pwa/s07-dashboard` (+ `s08…s22`) | `web/s04…s18` | stay |

## 4. Prompt rules (product logic agents must respect)

- **Install prompt:** browser-driven (beforeinstallprompt / Add-to-Home-Screen). Show once after a
  successful sign-in on a mobile browser. "Not now" ⇒ cool-down (suggest 14 days); never block the app.
- **Onboarding gate:** keyed to "installed PWA ∧ first launch". A user who declines install NEVER sees
  onboarding in the browser. Returning PWA users go straight to Dashboard.
- **Notifications gate:** asked only AFTER onboarding finishes (context is established first).
  Deny ⇒ quiet fallback (in-app banners); re-ask entry point lives in Settings, never popups.
- **Landing is one implementation**, responsive — not two divergent designs. The eventual replacement
  design must ship both breakpoints from the same code/markup.
- Sign-out from PWA returns to Landing (step 1), not to install/onboarding prompts.

## 5. Current state of the mocks (audit results)

✅ Implemented and consistent:
- Shared landing placeholder (web s01), auth screens (both formats)
- Full web set `web/s02–s19` replicating the PWA content 1:1 in desktop format
- Full PWA app set `pwa/s07–s22`; onboarding `pwa/s02–s04`
- **NEW** `pwa/s23-pwa-install.html` — bottom-sheet install prompt (dimmed dashboard behind)
- **NEW** `pwa/s24-notification-permission.html` — bell hero, benefit list, Allow/Later

⚠️ Known gaps / pending decisions:
- **Landing redesign pending** — owner will supply a reference design; replace `web/s01` (and keep
  responsive). PWA `s01-landing` is currently just the old mobile render of it.
- Preview numbering ≠ flow order: PWA preview lists onboarding before sign-in because numbers were
  assigned historically. **`docs/app-flow.md` (this file) is the canonical order.**
- PWA-wide muted grey `--text-grey #9CA3AF` still fails WCAG AA on white when used for small text
  (the web set already fixed this with `#665F53`). If the PWA palette is ever aligned, do it there.

## 6. Working conventions for agents

- **Edit generators, never generated HTML:** `docs/gen-web.cjs` (19 web screens) and
  `docs/gen-pwa.cjs` splits `docs/ui-preview.html` (now 24 sections) into per-screen files.
  Regenerate: `node docs/gen-web.cjs` / `node docs/gen-pwa.cjs`.
- **Design tokens:** see `docs/ui-migration-plan.md` §9.2 (web = kinari/sumi system, WCAG AA verified;
  PWA = original pastel tokens). Keep palettes internally consistent per surface.
- **Naming:** `sNN-slug.html`, zero-padded, matching the generator's slug map.
- **Verification:** load each changed screen headless and assert 0 horizontal overflow and WCAG AA
  contrast for text nodes (see git history for the audit scripts pattern used previously).
