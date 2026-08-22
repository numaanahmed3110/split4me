import 'server-only'

import { env } from '@/lib/env'

type OneSignalNotification = {
  headings: Record<string, string>
  contents: Record<string, string>
  /**
   * Target users by the alias the browser registers through
   * `OneSignal.login()` -- for us, the Clerk user id. One external id covers
   * every browser and device that user is signed in on. Capped by OneSignal at
   * 20,000 ids per call.
   */
  include_aliases?: { external_id: string[] }
  /** Required whenever `include_aliases` is used. */
  target_channel?: 'push'
  url?: string
}

/**
 * Send a web push via the OneSignal REST API.
 *
 * Needs ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY. The latter is the App API
 * key, which the `Key` scheme below expects -- the older "Legacy REST API Key"
 * uses `Basic` instead and gets a 401 here.
 *
 * @see https://documentation.onesignal.com/reference/create-notification
 */
export async function sendOneSignalPush(notification: OneSignalNotification) {
  if (!env.ONESIGNAL_APP_ID || !env.ONESIGNAL_REST_API_KEY) {
    console.warn('[OneSignal] Skipping push — credentials not configured')
    return { skipped: true as const }
  }

  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: env.ONESIGNAL_APP_ID,
      ...notification,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OneSignal API error ${response.status}: ${body}`)
  }

  // A 200 does not guarantee delivery. When no target was reachable -- nobody
  // subscribed yet, every alias unknown -- the API still answers 200, but with
  // no `id` and the reason in `errors`. Surface that instead of reporting a
  // send that never happened.
  const result = await response.json()
  if (!result.id) {
    console.warn('[OneSignal] No notification created:', result.errors)
    return { delivered: false as const, errors: result.errors }
  }

  return result
}

/**
 * Notify a set of users, identified by the Clerk user ids they are logged into
 * OneSignal with. Users who never granted notification permission are simply
 * unknown aliases and are skipped by OneSignal.
 */
export async function notifyUsers(
  clerkUserIds: string[],
  title: string,
  message: string,
  url?: string,
) {
  if (clerkUserIds.length === 0) return { skipped: true as const }

  return sendOneSignalPush({
    headings: { en: title },
    contents: { en: message },
    include_aliases: { external_id: clerkUserIds },
    target_channel: 'push',
    url,
  })
}
