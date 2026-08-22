'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import type { Group } from '@/generated/prisma/browser'
import { useLocale, useTranslations } from 'next-intl'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  warnings: string[]
  freelySpendable?: number
  exceedsBy?: number
  group: Group
  onConfirm: () => void
}

export function BudgetWarningDialog({
  open,
  onOpenChange,
  warnings,
  freelySpendable,
  exceedsBy,
  group,
  onConfirm,
}: Props) {
  const t = useTranslations('TripFund')
  const locale = useLocale()
  const currency = getCurrencyFromGroup(group)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('warning.title')}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm">
              {freelySpendable !== undefined && (
                <p>
                  {t('warning.freelySpendable', {
                    amount: formatCurrency(currency, freelySpendable, locale),
                  })}
                </p>
              )}
              {exceedsBy !== undefined && exceedsBy > 0 && (
                <p className="text-amber-600 font-medium">
                  {t('warning.exceedsBy', {
                    amount: formatCurrency(currency, exceedsBy, locale),
                  })}
                </p>
              )}
              <ul className="list-disc pl-4 space-y-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('warning.cancel')}
          </Button>
          <Button onClick={onConfirm}>{t('warning.continue')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function parseBudgetWarning(error: unknown): {
  warnings: string[]
  impact?: {
    current?: { freelySpendable?: number }
    exceedsFreelySpendableBy?: number
  }
} | null {
  if (!error || typeof error !== 'object') return null
  const message = 'message' in error ? String(error.message) : ''
  try {
    const parsed = JSON.parse(message) as {
      code?: string
      warnings?: string[]
      impact?: {
        current?: { freelySpendable?: number }
        exceedsFreelySpendableBy?: number
      }
    }
    if (parsed.code === 'BUDGET_WARNING') {
      return {
        warnings: parsed.warnings ?? [],
        impact: parsed.impact,
      }
    }
  } catch {
    return null
  }
  return null
}
