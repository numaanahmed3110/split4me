'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalClient) => void>
  }
}

type OneSignalClient = {
  init: (options: {
    appId: string
    notifyButton?: { enable: boolean }
    allowLocalhostAsSecureOrigin?: boolean
  }) => Promise<void>
}

/**
 * Initializes OneSignal web push when NEXT_PUBLIC_ONESIGNAL_APP_ID is set.
 * @see https://documentation.onesignal.com/docs/web-push-quickstart
 */
export function OneSignalInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId,
        notifyButton: { enable: false },
        allowLocalhostAsSecureOrigin: true,
      })
    })

    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return null
}
