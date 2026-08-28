'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalClient) => void>
  }
}

type OneSignalClient = {
  init: (options: {
    appId: string
    safari_web_id?: string
    notifyButton?: { enable: boolean }
    allowLocalhostAsSecureOrigin?: boolean
    serviceWorkerPath?: string
    serviceWorkerParam?: { scope: string }
  }) => Promise<void>
  login: (externalId: string) => Promise<void>
  logout: () => Promise<void>
  Notifications?: {
    permission?: boolean
    permissionNative?: NotificationPermission
    requestPermission: (fallbackToSettings?: boolean) => Promise<boolean>
  }
}

const SDK_SRC = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'

// The app already registers its own PWA service worker (public/sw.js) at scope
// "/". A service worker registration is keyed by scope, so letting OneSignal
// register its worker at the default "/" would not add a second worker -- it
// would overwrite ours, and ours would overwrite it right back on the next
// load, churning both. Giving OneSignal its own subdirectory scope keeps the
// two registrations independent. Push delivery is unaffected: push events are
// dispatched to the registration that holds the subscription, not to whichever
// worker happens to control the page.
// @see https://documentation.onesignal.com/docs/onesignal-service-worker
const SERVICE_WORKER_PATH = 'push/onesignal/OneSignalSDKWorker.js'
const SERVICE_WORKER_SCOPE = '/push/onesignal/'

// OneSignal is a page-wide singleton and `init()` rejects if it runs twice.
// Strict Mode -- on by default under the app router -- double-invokes effects
// in development, which would queue two `init()` calls and error on the
// second. A module-level flag covers that; the DOM check additionally covers a
// hot reload, which resets module state but leaves the injected script behind.
let queued = false

/**
 * Initializes OneSignal web push when NEXT_PUBLIC_ONESIGNAL_APP_ID is set, and
 * keeps the browser's push subscription attached to the signed-in user.
 *
 * @see https://documentation.onesignal.com/docs/web-push-quickstart
 */
export function OneSignalInit() {
  const { isLoaded, userId } = useAuth()
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  useEffect(() => {
    if (!appId) return
    if (queued || document.querySelector(`script[src="${SDK_SRC}"]`)) return
    queued = true

    // Safari's Web Push id is issued per site alongside the app id. Passing an
    // empty one is worse than passing none, so only include it when present.
    const safariWebId = process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId,
        ...(safariWebId ? { safari_web_id: safariWebId } : {}),
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: SERVICE_WORKER_PATH,
        serviceWorkerParam: { scope: SERVICE_WORKER_SCOPE },
      })
    })

    const script = document.createElement('script')
    script.src = SDK_SRC
    script.defer = true
    document.head.appendChild(script)

    // Deliberately no cleanup: the SDK registers a service worker and global
    // state that outlive this component, and removing the tag would not undo
    // any of it -- it would only let a remount inject a second copy.
  }, [appId])

  // Identify the subscription so the server can target it. The alias is the
  // Clerk user id, which is what `User.id` holds, so the server can address
  // members straight from the database with no id mapping of its own. One
  // external id spans every browser and device the user signs in on.
  const identifiedAs = useRef<string | null>(null)
  useEffect(() => {
    if (!appId || !isLoaded) return

    const next = userId ?? null
    // Skips the no-op first render for a signed-out visitor, so we never call
    // logout() on a session that was never logged in.
    if (identifiedAs.current === next) return
    const previous = identifiedAs.current
    identifiedAs.current = next

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        if (next) await OneSignal.login(next)
        else if (previous) await OneSignal.logout()
      } catch (error) {
        console.error('[OneSignal] Failed to identify subscription', error)
      }
    })
  }, [appId, isLoaded, userId])

  return null
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID)
}

export function getNativeNotificationPermission():
  NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported'
  }
  return Notification.permission
}

/** Ask for web-push permission from Settings — never from a floating bell. */
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  window.OneSignalDeferred = window.OneSignalDeferred || []

  const fromSdk = await new Promise<boolean | null>((resolve) => {
    let settled = false
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true
        resolve(null)
      }
    }, 800)

    window.OneSignalDeferred!.push(async (OneSignal) => {
      try {
        const granted = await OneSignal.Notifications?.requestPermission()
        if (!settled) {
          settled = true
          window.clearTimeout(timer)
          resolve(Boolean(granted))
        }
      } catch (error) {
        console.error('[OneSignal] Permission request failed', error)
        if (!settled) {
          settled = true
          window.clearTimeout(timer)
          resolve(null)
        }
      }
    })
  })

  if (fromSdk !== null) return fromSdk

  if (typeof Notification === 'undefined') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}
