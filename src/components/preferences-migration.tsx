'use client'

import {
  getArchivedGroups,
  getRecentGroups,
  getStarredGroups,
} from '@/app/groups/recent-groups-helpers'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'

/**
 * One-time migration of localStorage group prefs to the database when the user signs in.
 */
export function PreferencesMigration() {
  const { isSignedIn } = useAuth()
  const migrated = useRef(false)
  const migrate = trpc.preferences.migrateFromLocal.useMutation()

  useEffect(() => {
    if (!isSignedIn || migrated.current) return

    const recentGroups = getRecentGroups()
    if (recentGroups.length === 0) return

    const memberships: Record<string, string> = {}
    const defaultSplits: Record<string, string> = {}

    for (const group of recentGroups) {
      const activeUser = localStorage.getItem(`${group.id}-activeUser`)
      if (activeUser) memberships[group.id] = activeUser
      const split = localStorage.getItem(`${group.id}-defaultSplittingOptions`)
      if (split) defaultSplits[group.id] = split
    }

    migrated.current = true
    migrate.mutate({
      recentGroups,
      starredGroups: getStarredGroups(),
      archivedGroups: getArchivedGroups(),
      memberships,
      defaultSplits,
    })
  }, [isSignedIn, migrate])

  return null
}
