export const LAST_GROUP_KEY = 'split4me-last-group-id'

export function rememberLastGroup(groupId: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LAST_GROUP_KEY, groupId)
}

export function readLastGroup(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(LAST_GROUP_KEY)
}
