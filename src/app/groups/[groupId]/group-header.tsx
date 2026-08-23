'use client'

import { GroupTabs } from '@/app/groups/[groupId]/group-tabs'
import { ShareButton } from '@/app/groups/[groupId]/share-button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useCurrentGroup } from './current-group-context'

export const GroupHeader = () => {
  const { isLoading, groupId, group } = useCurrentGroup()

  return (
    <div className="flex flex-col justify-between gap-3">
      <h1 className="font-bold text-3xl tracking-tight">
        <Link href={`/groups/${groupId}`}>
          {isLoading ? (
            <Skeleton className="mt-1.5 mb-1.5 h-7 w-40" />
          ) : (
            <div className="flex">{group.name}</div>
          )}
        </Link>
      </h1>

      <div className="flex gap-2 justify-between items-center">
        <GroupTabs groupId={groupId} />
        {group && <ShareButton group={group} />}
      </div>
    </div>
  )
}
