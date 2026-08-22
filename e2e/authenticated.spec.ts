import path from 'node:path'
import { createGroup, EXPENSES_URL, uniqueSuffix } from './app'
import { signIn } from './clerk-auth'
import { expect, test } from './fixtures'

// These tests sign specific users in themselves (and one compares two users), so
// the fixture's per-worker auto sign-in would fight them.
test.use({ signedIn: false })

/** Reads the signed-in user's server-side preferences straight from tRPC. */
async function serverPrefs(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const res = await fetch(
      '/api/trpc/preferences.list?input=' +
        encodeURIComponent(JSON.stringify({ json: null })),
    )
    type Env = {
      result?: {
        data?: {
          json?: {
            groups: { id: string; name: string }[]
            starredGroupIds: string[]
            archivedGroupIds: string[]
          }
        }
      }
    }
    if (res.status !== 200) return { httpStatus: res.status } as never
    const parsed = (await res.json()) as Env | Env[]
    const env = Array.isArray(parsed) ? parsed[0] : parsed
    return env?.result?.data?.json ?? null
  })
}

/** The card for `name` in the recent/starred/archived lists. */
function groupCard(page: import('@playwright/test').Page, name: string) {
  return page
    .locator('li')
    .filter({ has: page.getByRole('link', { name, exact: true }) })
}

test('signs a Clerk test user in and reaches protected data', async ({
  page,
}) => {
  await signIn(page, 'test1@gmail.com')

  // The header swaps Sign in / Sign up for Clerk's UserButton.
  await expect(page.locator('.cl-userButtonTrigger')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Sign in$/ })).toHaveCount(0)

  // protectedProcedure now resolves instead of throwing UNAUTHORIZED.
  expect(await serverPrefs(page)).not.toBeNull()
})

test('records a visited group in the database rather than localStorage', async ({
  page,
}) => {
  await signIn(page, 'test1@gmail.com')

  const name = `E2E Auth Recent ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await expect
    .poll(
      async () =>
        (await serverPrefs(page))?.groups.some((g) => g.id === groupId),
      {
        timeout: 20_000,
      },
    )
    .toBe(true)

  await page.goto('/groups')
  await expect(
    page.getByRole('heading', { name: 'Recent groups' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible()

  // Signed in, SaveGroupLocally takes the tRPC branch, so the legacy
  // localStorage list must stay untouched.
  const local = await page.evaluate(() => localStorage.getItem('recentGroups'))
  expect(local === null || local === '[]').toBe(true)
})

test('stars a group and keeps it starred across a reload', async ({ page }) => {
  await signIn(page, 'test1@gmail.com')

  const name = `E2E Auth Star ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await page.goto('/groups')
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible()

  // The star toggle is the first icon button in the card and has no
  // accessible name, so it is addressed positionally.
  await groupCard(page, name).getByRole('button').first().click()

  await expect
    .poll(
      async () => (await serverPrefs(page))?.starredGroupIds.includes(groupId),
      {
        timeout: 20_000,
      },
    )
    .toBe(true)

  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Starred groups' }),
  ).toBeVisible()
})

test('archives a group into the archived section', async ({ page }) => {
  await signIn(page, 'test1@gmail.com')

  const name = `E2E Auth Archive ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await page.goto('/groups')
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible()

  await groupCard(page, name).getByRole('button').last().click()
  await page.getByRole('menuitem', { name: 'Archive group' }).click()

  await expect
    .poll(
      async () => (await serverPrefs(page))?.archivedGroupIds.includes(groupId),
      {
        timeout: 20_000,
      },
    )
    .toBe(true)

  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Archived groups' }),
  ).toBeVisible()
})

test('keeps one user\u2019s starred groups invisible to another', async ({
  page,
  browser,
}) => {
  await signIn(page, 'test1@gmail.com')

  const name = `E2E Auth Isolation ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })
  await page.goto('/groups')
  await groupCard(page, name).getByRole('button').first().click()
  await expect
    .poll(
      async () => (await serverPrefs(page))?.starredGroupIds.includes(groupId),
      {
        timeout: 20_000,
      },
    )
    .toBe(true)

  // A second user in a clean context must not inherit any of it.
  const otherContext = await browser.newContext()
  const other = await otherContext.newPage()
  await signIn(other, 'test2@gmail.com')
  const otherPrefs = await serverPrefs(other)
  expect(otherPrefs?.starredGroupIds ?? []).not.toContain(groupId)
  expect((otherPrefs?.groups ?? []).map((g) => g.id)).not.toContain(groupId)
  await otherContext.close()
})

test('scans a receipt with Nemotron and confirms the draft into an expense', async ({
  page,
}) => {
  // The extraction is a live multimodal model call, so allow for a slow round
  // trip rather than the suite's default 60s.
  test.setTimeout(240_000)

  await signIn(page, 'test1@gmail.com')

  const groupId = await createGroup(page, {
    name: `E2E Receipt ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  // Surface the reason when extraction fails instead of only timing out.
  page.on('console', (m) => {
    if (m.type() === 'error')
      console.log('[browser error]', m.text().slice(0, 300))
  })
  page.on('response', async (r) => {
    if (/receipt|drafts\.|voice/.test(r.url()) || r.status() >= 400) {
      console.log(
        '[net]',
        r.status(),
        r
          .url()
          .replace(/^https?:\/\/[^/]+/, '')
          .slice(0, 90),
      )
    }
  })

  await page.goto(`/groups/${groupId}/expenses`)
  await page
    .getByRole('button', { name: 'Create expense from receipt' })
    .click()

  // Wait for the dialog to actually render before handing it a file: setting
  // files on the not-yet-hydrated input makes React miss the change event, and
  // the upload silently never starts.
  await expect(page.getByText('Upload receipt photo')).toBeVisible()

  await page
    .locator('input[type="file"]')
    .setInputFiles(
      path.join(__dirname, '..', 'test-assets', 'synthetic-receipt.png'),
    )

  // The draft review replaces the upload prompt once extraction returns.
  const confirm = page.getByRole('button', { name: 'Confirm & add expense' })
  const failureToast = page.locator('[role="status"], li[data-state="open"]')
  await expect
    .poll(
      async () => {
        if (await confirm.count()) return 'draft'
        const toast = (await failureToast.allInnerTexts().catch(() => []))
          .join(' | ')
          .replace(/\s+/g, ' ')
          .trim()
        return toast ? `toast: ${toast}` : 'waiting'
      },
      { timeout: 180_000, intervals: [2000] },
    )
    .toBe('draft')

  await confirm.click()

  // Wait for the redirect the confirm handler performs itself. Navigating here
  // manually would abort the in-flight drafts.confirm request and the expense
  // would never be written.
  await page.waitForURL(EXPENSES_URL, { timeout: 60_000 })
  await expect(page.getByTestId('expense-card').first()).toBeVisible({
    timeout: 30_000,
  })
})
