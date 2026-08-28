'use client'
import { saveRecentGroup } from '@/app/groups/recent-groups-helpers'
import { rememberLastGroup } from '@/lib/last-group'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'
import { useCurrentGroup } from './current-group-context'

export function SaveGroupLocally() {
  const { group } = useCurrentGroup()
  const { isSignedIn } = useAuth()
  // Only `mutate` is destructured, on purpose: react-query keeps it
  // referentially stable, while the object `useMutation()` returns is recreated
  // on every render. Depending on that whole object made this an infinite loop
  // for signed-in users -- mutate() -> re-render -> new identity -> effect ->
  // mutate() -- which hammered preferences.touchRecent until the browser ran
  // out of connections.
  const { mutate: touchRecent } = trpc.preferences.touchRecent.useMutation()

  // Recording the visit once per (group, auth state) is enough, and keeps a
  // re-render from recording it a second time.
  const recorded = useRef<string | null>(null)

  useEffect(() => {
    if (!group) return

    const key = `${group.id}:${isSignedIn ? 'signed-in' : 'signed-out'}`
    if (recorded.current === key) return
    recorded.current = key
    rememberLastGroup(group.id)

    if (isSignedIn) {
      touchRecent({ groupId: group.id })
    } else {
      saveRecentGroup({ id: group.id, name: group.name })
    }
  }, [group, isSignedIn, touchRecent])

  return null
}
