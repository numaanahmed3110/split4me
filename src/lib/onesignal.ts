import 'server-only'

import { env } from '@/lib/env'

type OneSignalNotification = {
  headings: Record<string, string>
  contents: Record<string, string>
  include_player_ids?: string[]
  include_external_user_ids?: string[]
  url?: string
}

/**
 * Send a web push via OneSignal REST API.
 * Configure ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY after Vercel deploy.
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

  return response.json()
}

export async function notifyGroupMembers(
  playerIds: string[],
  title: string,
  message: string,
  url?: string,
) {
  if (playerIds.length === 0) return { skipped: true as const }

  return sendOneSignalPush({
    headings: { en: title },
    contents: { en: message },
    include_player_ids: playerIds,
    url,
  })
}
