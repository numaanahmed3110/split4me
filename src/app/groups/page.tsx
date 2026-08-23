import { RecentGroupList } from '@/app/groups/recent-group-list'
import { TrackPage } from '@/lib/analytics/track-page'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('Groups')

  return {
    title: t('recent'),
  }
}

export default async function GroupsPage() {
  return (
    <>
      <TrackPage path="/groups" />
      <div className="mx-auto w-full max-w-5xl px-5 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Your groups</h1>
          <p className="text-sm text-muted-foreground">
            Trips, flats and parties — all your shared expenses in one place.
          </p>
        </header>
        <RecentGroupList />
      </div>
    </>
  )
}
