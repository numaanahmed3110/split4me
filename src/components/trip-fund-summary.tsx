'use client'

import { Progress } from '@/components/ui/progress'
import { cn, formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Lock, PiggyBank } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCurrentGroup } from '@/app/groups/[groupId]/current-group-context'

export function TripFundSummary() {
  const t = useTranslations('TripFund')
  const locale = useLocale()
  const { groupId, group } = useCurrentGroup()

  const { data } = trpc.groups.fund.getSnapshot.useQuery({ groupId })

  if (!group || !data?.snapshot || !data.fund) return null

  const currency = getCurrencyFromGroup(group)
  const s = data.snapshot

  return (
    <Link href={`/groups/${groupId}/fund`} className="block mb-4">
      <div className="rounded-lg border bg-card p-4 hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
          <PiggyBank className="w-4 h-4" />
          {t('tripFund')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
          <div>
            <span className="text-muted-foreground">{t('totalBudget')}</span>
            <p>{formatCurrency(currency, s.targetAmount, locale)}</p>
          </div>
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
              <Lock className="w-3 h-3" /> {t('freelySpendable')}
            </span>
            <p className={cn(s.freelySpendable < s.remaining && 'text-amber-600')}>
              {formatCurrency(currency, s.freelySpendable, locale)}
            </p>
          </div>
        </div>
        <Progress value={Math.min(100, s.percentConsumed)} className="h-1.5" />
      </div>
    </Link>
  )
}
