'use client'

import { useCurrentGroup } from '@/app/groups/[groupId]/current-group-context'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Lock, PiggyBank } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export function TripFundSummary() {
  const t = useTranslations('TripFund')
  const locale = useLocale()
  const { groupId, group } = useCurrentGroup()

  const { data, isLoading } = trpc.groups.fund.getSnapshot.useQuery({ groupId })

  if (isLoading) {
    return <Skeleton className="h-28 w-full mb-4 rounded-3xl" />
  }

  if (!group || !data?.snapshot || !data.fund) return null

  const currency = getCurrencyFromGroup(group)
  const s = data.snapshot

  return (
    <Link href={`/groups/${groupId}/fund`} className="block mb-4">
      <div className="rounded-3xl border bg-card shadow-sm p-4 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <PiggyBank className="w-4 h-4" />
            {t('tripFund')}
          </div>
          <span className="text-xs text-muted-foreground">View details</span>
        </div>
        <p className="text-xs text-muted-foreground">{t('freelySpendable')}</p>
        <p
          className={cn(
            'text-2xl font-semibold tabular-nums',
            s.freelySpendable <= 0 && 'text-red-600',
          )}
        >
          {formatCurrency(currency, s.freelySpendable, locale)}
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs mt-3 mb-2">
          <div>
            <span className="text-muted-foreground">{t('spent')}</span>
            <p>{formatCurrency(currency, s.totalSpent, locale)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t('remaining')}</span>
            <p>{formatCurrency(currency, s.remaining, locale)}</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> {t('reserved')}
            </span>
            <p>{formatCurrency(currency, s.totalReserved, locale)}</p>
          </div>
        </div>
        <Progress value={Math.min(100, s.percentConsumed)} className="h-1.5" />
      </div>
    </Link>
  )
}
