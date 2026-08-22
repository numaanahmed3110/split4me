import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import useSWR, { Fetcher } from 'swr'

/** The display modes a browser reports when the app was launched as installed. */
const INSTALLED_DISPLAY_MODES = [
  '(display-mode: standalone)',
  '(display-mode: minimal-ui)',
  '(display-mode: fullscreen)',
  '(display-mode: window-controls-overlay)',
]

function detectInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false
  // iOS Safari never reports a display-mode for home-screen apps; it sets this
  // non-standard flag on navigator instead.
  if ((window.navigator as { standalone?: boolean }).standalone === true) {
    return true
  }
  return INSTALLED_DISPLAY_MODES.some((q) => window.matchMedia(q).matches)
}

/**
 * Whether the app is running as an installed PWA rather than in a browser tab.
 *
 * Deliberately starts `false` and resolves in an effect. Reading `matchMedia`
 * during the first render would be synchronous and flash-free, but this hook is
 * used inside client components that Next also renders on the server -- where
 * the answer is always `false` -- so a synchronous read would be a hydration
 * mismatch. Features gated on this therefore appear a beat after load in the
 * installed app, and never appear in a tab.
 */
export function useIsInstalledPwa(): boolean {
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const update = () => setInstalled(detectInstalledPwa())
    update()

    // The mode can change without a reload: launching an installed app from the
    // browser, or the user installing while the page is open.
    const lists = INSTALLED_DISPLAY_MODES.map((q) => window.matchMedia(q))
    lists.forEach((l) => l.addEventListener('change', update))
    return () => lists.forEach((l) => l.removeEventListener('change', update))
  }, [])

  return installed
}

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  }

  const [matches, setMatches] = useState<boolean>(getMatches(query))

  function handleChange() {
    setMatches(getMatches(query))
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query)

    // Triggered at the first client-side load and if query changes
    handleChange()

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange)
    } else {
      matchMedia.addEventListener('change', handleChange)
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange)
      } else {
        matchMedia.removeEventListener('change', handleChange)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return matches
}

export function useBaseUrl() {
  const [baseUrl, setBaseUrl] = useState<string | null>(null)
  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])
  return baseUrl
}

/**
 * Whether {@link useActiveUser} has a final answer yet.
 *
 * Signed out it reads localStorage, which is synchronous and therefore ready on
 * the first render. Signed in it waits on a tRPC query, so it reports `null`
 * for the first few renders — and a form that reads it to seed a default value
 * would silently miss it, because both react-hook-form's `defaultValues` and
 * Radix's uncontrolled `defaultValue` are only ever read once. Gate the form on
 * this before mounting it.
 */
export function useActiveUserReady(groupId?: string) {
  const { isSignedIn, isLoaded } = useAuth()
  // Same query key as useActiveUser, so react-query serves both from one fetch.
  const { isLoading } = trpc.preferences.getMembership.useQuery(
    { groupId: groupId! },
    { enabled: !!groupId && !!isSignedIn && isLoaded },
  )

  if (!groupId) return true
  if (!isLoaded) return false
  if (!isSignedIn) return true
  return !isLoading
}

/**
 * Active participant for a group — from DB when signed in, localStorage otherwise.
 */
export function useActiveUser(groupId?: string) {
  const { isSignedIn, isLoaded } = useAuth()
  const [localUser, setLocalUser] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !groupId) return null
    return localStorage.getItem(`${groupId}-activeUser`)
  })

  const { data: membership, isLoading } =
    trpc.preferences.getMembership.useQuery(
      { groupId: groupId! },
      { enabled: !!groupId && !!isSignedIn && isLoaded },
    )

  useEffect(() => {
    if (!groupId || isSignedIn) return
    const activeUser = localStorage.getItem(`${groupId}-activeUser`)
    setLocalUser(activeUser)
  }, [groupId, isSignedIn])

  if (!groupId) return null

  if (isSignedIn && isLoaded) {
    if (isLoading) return null
    return membership?.participantId ?? 'None'
  }

  return localUser
}

interface FrankfurterAPIResponse {
  base: string
  date: string
  rates: Record<string, number>
}

const fetcher: Fetcher<FrankfurterAPIResponse> = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok)
      throw new TypeError('Unsuccessful response from API', { cause: res })
    return res.json() as Promise<FrankfurterAPIResponse>
  })

export function useCurrencyRate(
  date: Date,
  baseCurrency: string,
  targetCurrency: string,
) {
  const dateString = dayjs(date).format('YYYY-MM-DD')

  // Only send request if both currency codes are given and not the same
  const url =
    !isNaN(date.getTime()) &&
    !!baseCurrency.length &&
    !!targetCurrency.length &&
    baseCurrency !== targetCurrency &&
    `https://api.frankfurter.dev/v1/${dateString}?base=${baseCurrency}`
  const { data, error, isLoading, mutate } = useSWR<FrankfurterAPIResponse>(
    url,
    fetcher,
    { shouldRetryOnError: false, revalidateOnFocus: false },
  )

  if (data) {
    let exchangeRate = undefined
    let sentError = error
    if (!error && data.date !== dateString) {
      // this happens if for example, the requested date is in the future.
      sentError = new RangeError(data.date)
    }
    if (data.rates[targetCurrency]) {
      exchangeRate = data.rates[targetCurrency]
    }
    return {
      data: exchangeRate,
      error: sentError,
      isLoading,
      refresh: mutate,
    }
  }

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}
