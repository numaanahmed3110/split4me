'use client'
import { AddGroupByUrlButton } from '@/app/groups/add-group-by-url-button'
import type { RecentGroups } from '@/app/groups/recent-groups-helpers'
import { useRecentGroupsState } from '@/app/groups/use-recent-groups'
import { GroupCardsSkeleton } from '@/components/page-skeleton'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { PropsWithChildren } from 'react'
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

  if (isLoading || !data) {
    return (
      <GroupsPage reload={refreshGroupsFromStorage}>
        <GroupCardsSkeleton />
      </GroupsPage>
    )
  }

  if (data.groups.length === 0) {
    return (
      <GroupsPage reload={refreshGroupsFromStorage}>
        <div className="text-sm space-y-2">
          <p>{t('NoRecent.description')}</p>
          <p>
            <Button variant="link" asChild className="-m-4">
              <Link href={`/groups/create`}>{t('NoRecent.create')}</Link>
            </Button>{' '}
            {t('NoRecent.orAsk')}
          </p>
        </div>
      </GroupsPage>
    )
  }

  const { starredGroupInfo, groupInfo, archivedGroupInfo } = sortGroups({
    groups,
    starredGroups,
    archivedGroups,
  })

  return (
    <GroupsPage reload={refreshGroupsFromStorage}>
      <GlobalBalanceCard groups={groups} />

      {starredGroupInfo.length > 0 && (
        <>
          <h2 className="text-lg font-semibold tracking-tight mt-8 mb-3">{t('starred')}</h2>
          <GroupList
            groups={starredGroupInfo}
            groupDetails={data.groups}
            archivedGroups={archivedGroups}
            starredGroups={starredGroups}
            refreshGroupsFromStorage={refreshGroupsFromStorage}
            isSignedIn={isSignedIn}
          />
        </>
      )}

      {groupInfo.length > 0 && (
        <>
          <h2 className="text-lg font-semibold tracking-tight mt-8 mb-3">{t('recent')}</h2>
          <GroupList
            groups={groupInfo}
            groupDetails={data.groups}
            archivedGroups={archivedGroups}
            starredGroups={starredGroups}
            refreshGroupsFromStorage={refreshGroupsFromStorage}
            isSignedIn={isSignedIn}
          />
        </>
      )}

      {archivedGroupInfo.length > 0 && (
        <>
          <h2 className="text-lg font-semibold tracking-tight mt-8 mb-3 opacity-50">{t('archived')}</h2>
          <div className="opacity-50">
            <GroupList
              groups={archivedGroupInfo}
              groupDetails={data.groups}
              archivedGroups={archivedGroups}
              starredGroups={starredGroups}
              refreshGroupsFromStorage={refreshGroupsFromStorage}
              isSignedIn={isSignedIn}
            />
          </div>
        </>
      )}
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
    <ul className="grid gap-2 sm:grid-cols-2">
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
        />
      ))}
    </ul>
  )
}

function GroupsPage({
  children,
  reload,
}: PropsWithChildren<{ reload: () => void }>) {
  const t = useTranslations('Groups')
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="font-bold text-2xl tracking-tight flex-1 tracking-tight">
          <Link href="/groups">{t('myGroups')}</Link>
        </h1>
        <div className="flex gap-2">
          <AddGroupByUrlButton reload={reload} />
          <Button asChild>
            <Link href="/groups/create">{t('create')}</Link>
          </Button>
        </div>
      </div>
      <div>{children}</div>
    </>
  )
}
