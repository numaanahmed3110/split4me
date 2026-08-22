import { Page } from '@playwright/test'
import { config } from 'dotenv'

config()

/**
 * Sign-in helpers for the four Clerk development users.
 *
 * These accounts cannot be signed in through the password form: Clerk rejects
 * their passwords with `form_password_pwned` ("found in an online data breach")
 * because they were created with "Ignore password policies" checked. So we mint
 * a short-lived **sign-in token** with the Backend API and hand it to Clerk as a
 * `__clerk_ticket`, which is the same mechanism `@clerk/testing` uses.
 */
export const TEST_EMAILS = [
  'test1@gmail.com',
  'test2@gmail.com',
  'test3@gmail.com',
  'test4@gmail.com',
] as const

export type TestEmail = (typeof TEST_EMAILS)[number]

/**
 * The account a given parallel worker owns. Workers must not share an account:
 * preferences (recent groups, starred, memberships) live in the database per
 * user, so two tests on one account would see each other's writes.
 */
export function workerEmail(parallelIndex: number): TestEmail {
  return TEST_EMAILS[parallelIndex % TEST_EMAILS.length]
}

function secret(): string {
  const key = process.env.CLERK_SECRET_KEY
  if (!key) throw new Error('CLERK_SECRET_KEY is not set')
  return key
}

const idCache = new Map<string, string>()

export async function clerkUserId(email: TestEmail): Promise<string> {
  const cached = idCache.get(email)
  if (cached) return cached
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${secret()}` } },
  )
  if (!res.ok) throw new Error(`Clerk user lookup failed: ${res.status}`)
  const users = (await res.json()) as { id: string }[]
  if (!users.length) throw new Error(`No Clerk user for ${email}`)
  idCache.set(email, users[0].id)
  return users[0].id
}

async function signInToken(userId: string): Promise<string> {
  const res = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 3600 }),
  })
  const body = (await res.json()) as { token?: string }
  if (!body.token) throw new Error(`sign_in_tokens failed: ${res.status}`)
  return body.token
}

/** Signs `email` in and resolves once a protected tRPC call actually succeeds. */
export async function signIn(page: Page, email: TestEmail): Promise<void> {
  const token = await signInToken(await clerkUserId(email))
  await page.goto(`/sign-in?__clerk_ticket=${encodeURIComponent(token)}`, {
    waitUntil: 'domcontentloaded',
  })

  // Clerk consumes the ticket asynchronously and then redirects, so poll a
  // protectedProcedure until it stops answering UNAUTHORIZED. Polled from Node
  // rather than with page.waitForFunction so a timeout fails loudly here
  // instead of surfacing as a confusing assertion error later.
  const deadline = Date.now() + 60_000
  let last = -1
  while (Date.now() < deadline) {
    last = await page
      .evaluate(async () => {
        try {
          const res = await fetch(
            '/api/trpc/preferences.list?input=' +
              encodeURIComponent(JSON.stringify({ json: null })),
          )
          return res.status
        } catch {
          return -1
        }
      })
      .catch(() => -1)
    if (last === 200) return
    await page.waitForTimeout(1000)
  }
  throw new Error(
    `Clerk ticket sign-in for ${email} never authenticated (last status ${last})`,
  )
}
