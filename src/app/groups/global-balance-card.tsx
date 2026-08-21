'use client'

import { RecentGroups } from '@/app/groups/recent-groups-helpers'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Currency, getCurrency } from '@/lib/currency'
import { cn, formatCurrency } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type CurrencyBalance = {
  currency: Currency
  amount: number
}

export function GlobalBalanceCard({ groups }: { groups: RecentGroups }) {
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

  const activeUserGroups = isSignedIn
    ? (serverMemberships?.memberships ?? null)
    : localActiveUserGroups

  if (activeUserGroups === null) return null
  if (activeUserGroups.length === 0) return null

  return <GlobalBalanceCard_ activeUserGroups={activeUserGroups} />
}

function GlobalBalanceCard_({
  activeUserGroups,
}: {
  activeUserGroups: { groupId: string; participantId: string }[]
}) {
  const locale = useLocale()
  const t = useTranslations('Groups.GlobalBalance')
  const { data, isLoading } = trpc.groups.balances.forUser.useQuery({
    groups: activeUserGroups,
  })

  if (isLoading || !data) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    )
  }

  const balancesByCurrency = data.balances.reduce(
    (acc, balance) => {
      const currency =
        getCurrency(balance.currencyCode ?? 'USD') ??
        ({
          symbol: balance.currency,
          code: balance.currencyCode ?? 'USD',
        } as Currency)
      const key = currency.code
      if (!acc[key]) {
        acc[key] = { currency, amount: 0 }
      }
      acc[key].amount += balance.amount
      return acc
    },
    {} as Record<string, CurrencyBalance>,
  )

  const balances = Object.values(balancesByCurrency)

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {balances.map(({ currency, amount }) => (
            <li
              key={currency.code}
              className={cn(
                'text-lg font-semibold',
                amount > 0 && 'text-emerald-600',
                amount < 0 && 'text-red-600',
              )}
            >
              {formatCurrency(currency, amount / 100, locale, true)}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
