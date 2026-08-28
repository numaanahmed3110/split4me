import { SettingsPageClient } from '@/app/settings/page.client'
import { TrackPage } from '@/lib/analytics/track-page'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('AccountSettings')
  return { title: t('title') }
}

export default function SettingsPage() {
  return (
    <>
      <TrackPage path="/settings" />
      <SettingsPageClient />
    </>
  )
}
