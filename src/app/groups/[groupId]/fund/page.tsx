import { TripFundPageClient } from '@/app/groups/[groupId]/fund/page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('TripFund')
  return { title: t('title') }
}

export default function TripFundPage() {
  return <TripFundPageClient />
}
