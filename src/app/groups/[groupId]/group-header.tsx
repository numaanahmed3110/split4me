'use client'

import { GroupTabs } from '@/app/groups/[groupId]/group-tabs'
import { ShareButton } from '@/app/groups/[groupId]/share-button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useCurrentGroup } from './current-group-context'

export const GroupHeader = () => {
  const { isLoading, groupId, group } = useCurrentGroup()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/groups"
          aria-label="Back to groups"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-xl md:text-2xl flex-1 truncate">
          <Link href={`/groups/${groupId}`}>
            {isLoading ? (
              <Skeleton className="mt-1.5 mb-1.5 h-5 w-32" />
            ) : (
              group.name
            )}
          </Link>
        </h1>
        {group && <ShareButton group={group} />}
      </div>
      <GroupTabs groupId={groupId} />
    </div>
  )
}
