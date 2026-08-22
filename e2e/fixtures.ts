import { test as base, expect } from '@playwright/test'
import { clerkUserId, signIn, workerEmail } from './clerk-auth'
import { resetUserState } from './db'

/**
 * Shared test fixture.
 *
 * Four things every spec needs:
 *
 * 1. A signed-in user. Everything under /groups is gated by src/proxy.ts, so a
 *    signed-out run just lands on the sign-in page. Each parallel worker gets
 *    its own Clerk account so the server-side preferences one test writes
 *    (recent groups, starred, memberships) cannot bleed into a test running
 *    beside it. Opt out with `test.use({ signedIn: false })` in the specs that
 *    assert the gate itself.
 *
 * 2. The "Who are you?" dialog. It opens on a group's expenses page whenever
 *    neither `newGroup-activeUser` nor `<groupId>-activeUser` is in
 *    localStorage, and it is a modal that blocks pointer events -- and, being
 *    `aria-modal`, hides the rest of the page from every role-based query. 'None'
 *    is deliberate: any other value would pre-fill "Paid by" and make expense
 *    tests depend on hidden state.
 *
 * 3. The locale. Assertions are English literals and amounts are formatted by
 *    Intl, so both the app locale (NEXT_LOCALE cookie, which outranks
 *    Accept-Language in src/lib/locale.ts) and the browser locale are pinned.
 *
 * 4. A hermetic network for the third-party calls the app makes.
 */
type Options = {
  /**
   * Seed `newGroup-activeUser` so the "Who are you?" dialog stays shut.
   * Defaults to true. Set `test.use({ seedActiveUser: false })` in the spec
   * that exercises the dialog itself.
   */
  seedActiveUser: boolean

  /**
   * Rate returned for every api.frankfurter.dev request, so currency
   * conversion is deterministic and offline. Null (the default) aborts the
   * request instead, which is what every non-currency spec wants.
   */
  exchangeRate: number | null

  /**
   * Sign a Clerk test user in before the test body runs. Defaults to true.
   * Set `test.use({ signedIn: false })` to assert unauthenticated behaviour.
   */
  signedIn: boolean
}

export const test = base.extend<Options>({
  seedActiveUser: [true, { option: true }],
  exchangeRate: [null, { option: true }],
  signedIn: [true, { option: true }],

  // The second argument is Playwright's `use` callback, renamed because
  // eslint-plugin-react-hooks would otherwise read `use(...)` as React's hook.
  page: async (
    { page, baseURL, seedActiveUser, exchangeRate, signedIn },
    runTest,
    testInfo,
  ) => {
    if (baseURL) {
      await page
        .context()
        .addCookies([{ name: 'NEXT_LOCALE', value: 'en-US', url: baseURL }])
    }

    if (seedActiveUser) {
      // Seeded once per context, not on every navigation. `addInitScript` runs
      // on each one, and the app *consumes* this key -- it promotes it to
      // `<groupId>-activeUser` and, signed in, to a GroupMember row. Re-seeding
      // 'None' on every page load therefore kept re-promoting and wiped the
      // active participant a test had just chosen.
      await page.addInitScript(() => {
        try {
          if (window.localStorage.getItem('e2e-activeUser-seeded')) return
          window.localStorage.setItem('e2e-activeUser-seeded', '1')
          if (!window.localStorage.getItem('newGroup-activeUser')) {
            window.localStorage.setItem('newGroup-activeUser', 'None')
          }
        } catch (err) {
          // localStorage is unavailable on about:blank; nothing to seed there.
        }
      })
    }

    // The suite must never depend on a third-party API. useCurrencyRate calls
    // this only when the expense currency differs from the group currency.
    await page.route('https://api.frankfurter.dev/**', (route) => {
      if (exchangeRate === null) return route.abort()

      // Request shape: /v1/<YYYY-MM-DD>?base=<CODE>. The hook turns the
      // response into a RangeError unless `date` echoes the requested date
      // exactly, so mirror it back rather than inventing one.
      const url = new URL(route.request().url())
      const date = url.pathname.split('/').pop() ?? ''
      const base = url.searchParams.get('base') ?? ''

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          base,
          date,
          rates: { USD: exchangeRate, EUR: exchangeRate, GBP: exchangeRate },
        }),
      })
    })

    // Currency and category pickers render flag images from a CDN. Nothing is
    // asserted on them and they only add latency, so keep the run hermetic.
    await page.route('https://flagcdn.com/**', (route) => route.abort())

    if (signedIn) {
      const email = workerEmail(testInfo.parallelIndex)
      // Reset first: preferences now live in the database per user, and workers
      // share a pool of accounts, so without this a test inherits the recent
      // groups and memberships of every test that ran before it on this worker.
      await resetUserState(await clerkUserId(email))
      await signIn(page, email)
    }

    await runTest(page)
  },
})

export { expect }
