import { expect, test } from './fixtures'

/**
 * The authentication gate.
 *
 * Before auth was added, any visitor could use every group/expense tRPC procedure
 * `baseProcedure` and `src/proxy.ts` ran a bare `clerkMiddleware()` that
 * protected nothing -- anyone could list, read, create and edit any group
 * without signing in. These tests pin the gate shut.
 */
test.use({ signedIn: false })

const SIGN_IN = /\/sign-in(\?|$|\/)/

test.describe('unauthenticated visitors', () => {
  test('are redirected to sign-in from the group list', async ({ page }) => {
    await page.goto('/groups')
    await expect(page).toHaveURL(SIGN_IN)
  })

  test('are redirected to sign-in from the create-group form', async ({
    page,
  }) => {
    await page.goto('/groups/create')
    await expect(page).toHaveURL(SIGN_IN)
  })

  test('are redirected to sign-in from a group they know the URL of', async ({
    page,
  }) => {
    // A real group id is not needed: the gate must run before anything is read,
    // so an unauthenticated request never gets far enough to 404.
    await page.goto('/groups/some-group-id/expenses')
    await expect(page).toHaveURL(SIGN_IN)
  })

  test('cannot read group data over tRPC', async ({ page }) => {
    await page.goto('/sign-in')

    const result = await page.evaluate(async () => {
      const call = async (path: string, input: unknown) => {
        const res = await fetch(
          `/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`,
        )
        return {
          path,
          status: res.status,
          body: (await res.text()).slice(0, 200),
        }
      }
      return Promise.all([
        call('groups.list', { groupIds: ['some-group-id'] }),
        call('groups.get', { groupId: 'some-group-id' }),
        call('groups.expenses.list', { groupId: 'some-group-id' }),
        call('groups.balances.list', { groupId: 'some-group-id' }),
        call('groups.stats.overview', { groupId: 'some-group-id' }),
        call('groups.activities.list', { groupId: 'some-group-id' }),
        call('categories.list', null),
      ])
    })

    for (const call of result) {
      expect(call.status, `${call.path} -> ${call.body}`).toBe(401)
      expect(call.body).toContain('UNAUTHORIZED')
    }
  })

  test('cannot create a group over tRPC', async ({ page }) => {
    await page.goto('/sign-in')

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/trpc/groups.create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          json: {
            groupFormValues: {
              name: 'Should not exist',
              currency: '$',
              participants: [{ name: 'Alice' }, { name: 'Bob' }],
            },
          },
        }),
      })
      return { status: res.status, body: (await res.text()).slice(0, 300) }
    })

    expect(result.status, result.body).toBe(401)
    expect(result.body).toContain('UNAUTHORIZED')
  })

  test('cannot export a group as CSV or JSON', async ({ page }) => {
    for (const format of ['csv', 'json']) {
      const res = await page.request.get(
        `/groups/some-group-id/expenses/export/${format}`,
        { maxRedirects: 0 },
      )
      // Either the sign-in redirect from the middleware or Clerk's 404/401 for
      // a protected handler is acceptable; serving the file is not.
      expect(
        [301, 302, 303, 307, 308, 401, 404].includes(res.status()),
        `${format} returned ${res.status()}`,
      ).toBe(true)
    }
  })

  test('can still reach the landing page and the auth pages', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: /^Sign in$/ })).toBeVisible()

    await page.goto('/sign-in')
    await expect(page.locator('main input[name="identifier"]')).toBeVisible()

    await page.goto('/sign-up')
    await expect(page.locator('main')).toBeVisible()
  })

  test('can still reach the health endpoints', async ({ page }) => {
    for (const path of ['/api/health/liveness', '/api/health/readiness']) {
      const res = await page.request.get(path)
      expect(res.status(), `${path} returned ${res.status()}`).toBe(200)
    }
  })
})
