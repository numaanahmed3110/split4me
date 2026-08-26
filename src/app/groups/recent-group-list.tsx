'use client'
import { AddGroupByUrlButton } from '@/app/groups/add-group-by-url-button'
import type { RecentGroups } from '@/app/groups/recent-groups-helpers'
import { useRecentGroupsState } from '@/app/groups/use-recent-groups'
import { FirstRunGuide } from '@/components/first-run-guide'
import { GroupCardsSkeleton } from '@/components/page-skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/trpc/client'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { PropsWithChildren, useMemo, useState } from 'react'
import { GlobalBalanceCard } from './global-balance-card'
import { RecentGroupListCard } from './recent-group-list-card'

function sortGroups({
  groups,
  starredGroups,
  archivedGroups,
}: {
  groups: RecentGroups
  starredGroups: string[]
  archivedGroups: string[]
}) {
  const starredGroupInfo = []
  const groupInfo = []
  const archivedGroupInfo = []
  for (const group of groups) {
    if (starredGroups.includes(group.id)) {
      starredGroupInfo.push(group)
    } else if (archivedGroups.includes(group.id)) {
      archivedGroupInfo.push(group)
    } else {
      groupInfo.push(group)
    }
  }
  return {
    starredGroupInfo,
    groupInfo,
    archivedGroupInfo,
  }
}

function greetingKey(hour: number) {
  if (hour < 12) return 'greetingMorning' as const
  if (hour < 18) return 'greetingAfternoon' as const
  return 'greetingEvening' as const
}

export function RecentGroupList() {
  const state = useRecentGroupsState()

  if (state.status === 'pending') {
    return (
      <GroupsPage reload={() => undefined}>
        <GroupCardsSkeleton />
      </GroupsPage>
    )
  }

  return (
    <RecentGroupList_
      groups={state.groups}
      starredGroups={state.starredGroups}
      archivedGroups={state.archivedGroups}
      refreshGroupsFromStorage={state.refresh}
      isSignedIn={state.isSignedIn}
    />
  )
}

function RecentGroupList_({
  groups,
  starredGroups,
  archivedGroups,
  refreshGroupsFromStorage,
  isSignedIn,
}: {
  groups: RecentGroups
  starredGroups: string[]
  archivedGroups: string[]
  refreshGroupsFromStorage: () => void
  isSignedIn: boolean
}) {
  const t = useTranslations('Groups')
  const { data, isLoading } = trpc.groups.list.useQuery({
    groupIds: groups.map((group) => group.id),
  })
  const [filter, setFilter] = useState<'nearby' | 'recent' | 'history'>(
    'nearby',
  )

  const actions = (
    <div className="grid grid-cols-2 gap-2">
      <Button
        asChild
        className="h-11 rounded-full bg-[#1D1C22] text-white hover:bg-[#1D1C22]/90"
      >
        <Link href="/groups/create">{t('createGroup')}</Link>
      </Button>
      <AddGroupByUrlButton
        reload={refreshGroupsFromStorage}
        label={t('joinGroup')}
        className="h-11 rounded-full w-full bg-[#E8D9B8] text-[#1D1C22] hover:bg-[#E8D9B8]/90 border-0"
      />
    </div>
  )

  if (isLoading || !data) {
    return (
      <GroupsPage reload={refreshGroupsFromStorage}>
        <GlobalBalanceCard groups={groups} actions={actions} />
        <GroupCardsSkeleton />
      </GroupsPage>
    )
  }

  if (data.groups.length === 0) {
    return (
      <GroupsPage reload={refreshGroupsFromStorage}>
        <FirstRunGuide hasGroups={false} />
        <GlobalBalanceCard groups={groups} actions={actions} />
        <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-muted-foreground mb-4">
            {t('NoRecent.description')}
          </p>
          <p className="text-xs text-muted-foreground">{t('NoRecent.orAsk')}</p>
        </div>
      </GroupsPage>
    )
  }

  const { starredGroupInfo, groupInfo, archivedGroupInfo } = sortGroups({
    groups,
    starredGroups,
    archivedGroups,
  })

  const nearbyGroups = [...starredGroupInfo, ...groupInfo]
  const visible =
    filter === 'nearby'
      ? nearbyGroups
      : filter === 'recent'
        ? groupInfo
        : archivedGroupInfo

  return (
    <GroupsPage reload={refreshGroupsFromStorage}>
      <div className="md:hidden">
        <GlobalBalanceCard groups={groups} actions={actions} />
      </div>
      <div className="hidden md:block">
        <GlobalBalanceCard groups={groups} />
      </div>

      <Tabs
        value={filter}
        onValueChange={(next) =>
          setFilter(next as 'nearby' | 'recent' | 'history')
        }
        className="mt-1"
      >
        <TabsList className="w-full h-auto bg-[#F5F5F5] p-1 rounded-full">
          <TabsTrigger value="nearby" className="flex-1 rounded-full">
            {t('tabNearby')}
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex-1 rounded-full">
            {t('tabRecent')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-full">
            {t('tabHistory')}
          </TabsTrigger>
        </TabsList>
        <p className="text-xs text-muted-foreground mt-2 px-1 md:hidden">
          {filter === 'nearby'
            ? t('tabNearbyHint')
            : filter === 'recent'
              ? t('tabRecentHint')
              : t('tabHistoryHint')}
        </p>
      </Tabs>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {t('emptyFilter')}
        </p>
      ) : (
        <GroupList
          groups={visible}
          groupDetails={data.groups}
          archivedGroups={archivedGroups}
          starredGroups={starredGroups}
          refreshGroupsFromStorage={refreshGroupsFromStorage}
          isSignedIn={isSignedIn}
        />
      )}

      <Button
        asChild
        className="h-14 w-full rounded-full bg-[#D8CEFA] text-[#1D1C22] text-base font-semibold hover:bg-[#D8CEFA]/90 shadow-[0_12px_30px_rgba(216,206,250,0.55)] md:hidden"
      >
        <Link href="/groups/create">{t('addSplit')}</Link>
      </Button>
    </GroupsPage>
  )
}

function GroupList({
  groups,
  groupDetails,
  starredGroups,
  archivedGroups,
  refreshGroupsFromStorage,
  isSignedIn,
}: {
  groups: RecentGroups
  groupDetails?: AppRouterOutput['groups']['list']['groups']
  starredGroups: string[]
  archivedGroups: string[]
  refreshGroupsFromStorage: () => void
  isSignedIn: boolean
}) {
  return (
    <>
      <ul className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        {groups.map((group, index) => (
          <RecentGroupListCard
            key={group.id}
            group={group}
            groupDetail={groupDetails?.find(
              (groupDetail) => groupDetail.id === group.id,
            )}
            isStarred={starredGroups.includes(group.id)}
            isArchived={archivedGroups.includes(group.id)}
            refreshGroupsFromStorage={refreshGroupsFromStorage}
            isSignedIn={isSignedIn}
            variant="bill"
            featured={index === 0}
          />
        ))}
      </ul>
      <ul className="hidden md:grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <RecentGroupListCard
            key={group.id}
            group={group}
            groupDetail={groupDetails?.find(
              (groupDetail) => groupDetail.id === group.id,
            )}
            isStarred={starredGroups.includes(group.id)}
            isArchived={archivedGroups.includes(group.id)}
            refreshGroupsFromStorage={refreshGroupsFromStorage}
            isSignedIn={isSignedIn}
            variant="card"
          />
        ))}
      </ul>
    </>
  )
}

function GroupsPage({
  children,
  reload,
}: PropsWithChildren<{ reload: () => void }>) {
  const t = useTranslations('Groups')
  const { user } = useUser()
  const firstName = user?.firstName || user?.username || t('friendFallback')
  const greeting = useMemo(() => t(greetingKey(new Date().getHours())), [t])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {t('helloName', { name: firstName })}
          </p>
          <h1 className="font-bold text-[26px] md:text-[30px] tracking-tight leading-tight">
            {greeting}
          </h1>
        </div>
        <div className="hidden md:flex gap-2">
          <AddGroupByUrlButton reload={reload} />
          <Button asChild>
            <Link href="/groups/create">{t('create')}</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </>
  )
}
