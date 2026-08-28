'use client'

import { RecentGroups } from '@/app/groups/recent-groups-helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { Currency } from '@/lib/currency'
import { cn, formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState, type ReactNode } from 'react'

type CurrencyBalance = {
  currency: Currency
  amount: number
}

export function GlobalBalanceCard({
  groups,
  actions,
}: {
  groups: RecentGroups
  actions?: ReactNode
}) {
  const { isSignedIn } = useAuth()
  const [localActiveUserGroups, setLocalActiveUserGroups] = useState<
    { groupId: string; participantId: string }[] | null
  >(null)

  const groupIds = groups.map((g) => g.id)
  const { data: serverMemberships } =
    trpc.preferences.membershipsForGroups.useQuery(
      { groupIds },
      { enabled: !!isSignedIn && groupIds.length > 0 },
    )

  useEffect(() => {
    if (isSignedIn) return
    setLocalActiveUserGroups(
      groups.flatMap((group) => {
        const participantId = localStorage.getItem(`${group.id}-activeUser`)
        if (!participantId || participantId === 'None') return []
        return [{ groupId: group.id, participantId }]
      }),
    )
  }, [groups, isSignedIn])

  const waitingForMemberships =
    isSignedIn === undefined ||
    (!isSignedIn && localActiveUserGroups === null) ||
    (!!isSignedIn && groupIds.length > 0 && !serverMemberships)

  const activeUserGroups = isSignedIn
    ? (serverMemberships?.memberships ?? [])
    : (localActiveUserGroups ?? [])

  return (
    <YellowBalanceShell actions={actions}>
      {waitingForMemberships ? (
        <Skeleton className="h-8 w-40 bg-[#f3e08a]" />
      ) : (
        <GlobalBalanceAmounts activeUserGroups={activeUserGroups} />
      )}
    </YellowBalanceShell>
  )
}

function YellowBalanceShell({
  children,
  actions,
}: {
  children: ReactNode
  actions?: ReactNode
}) {
  const t = useTranslations('Groups.GlobalBalance')
  return (
    <section className="rounded-[32px] bg-[#FDECAD] shadow-[0_15px_35px_rgba(0,0,0,0.06)] p-5">
      <p className="text-sm font-medium text-[#6F5A14]">{t('title')}</p>
      <div className="mt-3">{children}</div>
      {actions ? <div className="mt-5">{actions}</div> : null}
    </section>
  )
}

function GlobalBalanceAmounts({
  activeUserGroups,
}: {
  activeUserGroups: { groupId: string; participantId: string }[]
}) {
  const locale = useLocale()
  const t = useTranslations('Groups.GlobalBalance')
  const { data, isLoading } = trpc.groups.balances.forUser.useQuery(
    { groups: activeUserGroups },
    { enabled: activeUserGroups.length > 0 },
  )

  if (activeUserGroups.length === 0) {
    return (
      <>
        <p className="font-extrabold tabular-nums text-[32px] tracking-tight leading-none">
          $0.00
        </p>
        <p className="text-xs text-[#6F5A14] mt-2">{t('pickYourself')}</p>
      </>
    )
  }

  if (isLoading || !data) {
    return <Skeleton className="h-8 w-40 bg-[#f3e08a]" />
  }

  const byCurrency = new Map<string, CurrencyBalance>()
  for (const balance of data.balances) {
    const currency = getCurrencyFromGroup(balance)
    const key = currency.code || `custom:${currency.symbol}`
    const existing = byCurrency.get(key)
    if (existing) {
      existing.amount += balance.amount
    } else {
      byCurrency.set(key, { currency, amount: balance.amount })
    }
  }

  const currencyBalances = [...byCurrency.values()]
  const isSettledUp = currencyBalances.every(({ amount }) => amount === 0)

  if (isSettledUp) {
    return (
      <>
        <p className="font-extrabold tabular-nums text-[32px] tracking-tight leading-none">
          $0.00
        </p>
        <p className="text-xs text-[#6F5A14] mt-2">{t('settledUp')}</p>
      </>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {currencyBalances.map(({ currency, amount }) => {
        if (amount === 0) return null
        const formatted = formatCurrency(currency, Math.abs(amount), locale)
        return (
          <li
            key={currency.code || currency.symbol}
            className="flex justify-between items-baseline gap-2"
          >
            <span className="text-sm text-[#6F5A14]">
              {amount > 0 ? t('owedToYou') : t('youOwe')}
            </span>
            <span
              className={cn(
                'font-extrabold tabular-nums text-[32px] tracking-tight leading-none',
                amount > 0 ? 'text-[#1B7A47]' : 'text-[#DC2626]',
              )}
            >
              {formatted}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
