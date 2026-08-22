import { config } from 'dotenv'
import { Client } from 'pg'

config()

function connectionString(): string {
  const raw = process.env.POSTGRES_URL_NON_POOLING
  if (!raw) throw new Error('POSTGRES_URL_NON_POOLING is not set')
  const url = new URL(raw)
  // `pg` only honours the `ssl` option when the URL does not pin an `sslmode`,
  // and Supabase presents a self-signed chain, so the mode has to come from the
  // option instead of the query string.
  url.searchParams.delete('sslmode')
  return url.toString()
}

/**
 * Wipe everything the app stores per user, so each test starts from the state a
 * brand-new account is in.
 *
 * The suite used to get this for free: preferences lived in localStorage, so a
 * fresh browser context was a fresh profile. Now that the app requires signing
 * in they live in the database keyed by user, and the workers share a small pool
 * of Clerk accounts -- without this, recent groups and group memberships pile up
 * across tests and the cross-group assertions (the global balance card in
 * particular) see groups they never created.
 *
 * Only the join/preference rows are removed. Groups and expenses are left alone:
 * they are not owned by a user, every test creates its own with a unique name,
 * and deleting them would race with tests running in parallel.
 */
export async function resetUserState(userId: string): Promise<void> {
  const client = new Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  try {
    await client.query(
      'DELETE FROM "UserGroupPreference" WHERE "userId" = $1',
      [userId],
    )
    await client.query('DELETE FROM "GroupMember" WHERE "userId" = $1', [
      userId,
    ])
  } finally {
    await client.end()
  }
}
