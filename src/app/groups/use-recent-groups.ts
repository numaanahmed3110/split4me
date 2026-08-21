'use client'

import {
  RecentGroups,
  getArchivedGroups,
  getRecentGroups,
  getStarredGroups,
} from '@/app/groups/recent-groups-helpers'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'

export function useRecentGroupsState() {
  const { isSignedIn } = useAuth()
  const [localGroups, setLocalGroups] = useState<RecentGroups>([])
  const [localStarred, setLocalStarred] = useState<string[]>([])
  const [localArchived, setLocalArchived] = useState<string[]>([])
  const [localLoaded, setLocalLoaded] = useState(false)

  const { data: serverPrefs, refetch } = trpc.preferences.list.useQuery(
    undefined,
    { enabled: !!isSignedIn },
  )

  const loadLocal = useCallback(() => {
    setLocalGroups(getRecentGroups())
    setLocalStarred(getStarredGroups())
    setLocalArchived(getArchivedGroups())
    setLocalLoaded(true)
  }, [])

  useEffect(() => {
    if (!isSignedIn) loadLocal()
  }, [isSignedIn, loadLocal])

  if (isSignedIn) {
    if (!serverPrefs) {
      return { status: 'pending' as const }
    }
    return {
      status: 'ready' as const,
      groups: serverPrefs.groups.map((g) => ({ id: g.id, name: g.name })),
      starredGroups: serverPrefs.starredGroupIds,
      archivedGroups: serverPrefs.archivedGroupIds,
      refresh: () => refetch(),
      isSignedIn: true,
    }
  }

  if (!localLoaded) {
    return { status: 'pending' as const }
  }

  return {
    status: 'ready' as const,
    groups: localGroups,
    starredGroups: localStarred,
    archivedGroups: localArchived,
    refresh: loadLocal,
    isSignedIn: false,
  }
}
