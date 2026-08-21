'use client'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useCurrentGroup } from './current-group-context'
import { saveRecentGroup } from '@/app/groups/recent-groups-helpers'

export function SaveGroupLocally() {
  const { group } = useCurrentGroup()
  const { isSignedIn } = useAuth()
  const touchRecent = trpc.preferences.touchRecent.useMutation()

  useEffect(() => {
    if (!group) return
    if (isSignedIn) {
      touchRecent.mutate({ groupId: group.id })
    } else {
      saveRecentGroup({ id: group.id, name: group.name })
    }
  }, [group, isSignedIn, touchRecent])

  return null
}
