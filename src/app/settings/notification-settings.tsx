'use client'

import {
  getNativeNotificationPermission,
  isPushConfigured,
  requestPushPermission,
} from '@/components/onesignal-init'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type PermissionState = NotificationPermission | 'unsupported' | 'unknown'

export function NotificationSettings() {
  const t = useTranslations('AccountSettings')
  const [permission, setPermission] = useState<PermissionState>('unknown')
  const [busy, setBusy] = useState(false)
  const configured = isPushConfigured()

  useEffect(() => {
    setPermission(getNativeNotificationPermission())
  }, [])

  const enabled = permission === 'granted'
  const canAsk =
    configured &&
    permission !== 'granted' &&
    permission !== 'denied' &&
    permission !== 'unsupported'

  async function enable() {
    if (!canAsk || busy) return
    setBusy(true)
    try {
      const granted = await requestPushPermission()
      setPermission(granted ? 'granted' : getNativeNotificationPermission())
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold mb-1">
            {t('notificationsTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('notificationsDescription')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t('notificationsTitle')}
          disabled={!canAsk || busy}
          onClick={() => void enable()}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60',
            enabled ? 'bg-[#1D1C22]' : 'bg-[#E5E5E5]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform',
              enabled && 'translate-x-5',
            )}
          />
        </button>
      </div>

      <div className="mt-4">
        {!configured ? (
          <p className="text-sm text-muted-foreground">
            {t('notificationsOff')}
          </p>
        ) : enabled ? (
          <p className="text-sm font-medium text-[#1B7A47]">
            {t('notificationsOn')}
          </p>
        ) : permission === 'denied' ? (
          <p className="text-sm text-muted-foreground">
            {t('notificationsDenied')}
          </p>
        ) : permission === 'unsupported' ? (
          <p className="text-sm text-muted-foreground">
            {t('notificationsUnsupported')}
          </p>
        ) : (
          <Button
            type="button"
            className="h-11 rounded-full bg-[#D8CEFA] text-[#1D1C22] hover:bg-[#D8CEFA]/90"
            disabled={busy}
            onClick={() => void enable()}
          >
            {busy ? t('notificationsEnabling') : t('notificationsEnable')}
          </Button>
        )}
      </div>
    </section>
  )
}
