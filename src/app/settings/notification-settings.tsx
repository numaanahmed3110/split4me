'use client'

import {
  getNativeNotificationPermission,
  isPushConfigured,
  requestPushPermission,
} from '@/components/onesignal-init'
import { Button } from '@/components/ui/button'
import { Switch1 } from '@/components/ui/switch-01'
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

  async function enable(next = true) {
    if (!next || !canAsk || busy) return
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
      <h2 className="text-sm font-semibold mb-1">{t('notificationsTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t('notificationsDescription')}
      </p>
      <Switch1
        id="notifications"
        label={t('notificationsEnable')}
        checked={enabled}
        disabled={!canAsk || busy}
        onCheckedChange={(checked) => void enable(checked)}
      />

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
            className="mt-2 h-11 rounded-full bg-[#D8CEFA] text-[#1D1C22] hover:bg-[#D8CEFA]/90"
            disabled={busy}
            onClick={() => void enable(true)}
          >
            {busy ? t('notificationsEnabling') : t('notificationsEnable')}
          </Button>
        )}
      </div>
    </section>
  )
}
