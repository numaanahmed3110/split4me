'use client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import type { Group } from '@/generated/prisma/browser'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'

type Props = {
  group: Group
  form: UseFormReturn<ExpenseFormInput, any, ExpenseFormValues>
  expenseId?: string
}

export function ExpenseFundFields({ group, form, expenseId }: Props) {
  const t = useTranslations('TripFund')
  const locale = useLocale()
  const currency = getCurrencyFromGroup(group)

  const { data } = trpc.groups.fund.getSnapshot.useQuery({ groupId: group.id })
  const amount = form.watch('amount')
  const isReimbursement = form.watch('isReimbursement')
  const budgetId = form.watch('budgetId')
  const reserveId = form.watch('reserveId')

  const numericAmount =
    typeof amount === 'string' ? Math.round(Number(amount) * 100) : Math.round(Number(amount) * 100)

  const { data: impact } = trpc.groups.fund.previewExpense.useQuery(
    {
      groupId: group.id,
      amount: Number.isFinite(numericAmount) ? numericAmount : 0,
      isReimbursement: !!isReimbursement,
      budgetId: budgetId || null,
      reserveId: reserveId || null,
      excludeExpenseId: expenseId,
    },
    {
      enabled: !!data?.fund && !isReimbursement && numericAmount > 0,
    },
  )

  useEffect(() => {
    if (!data?.fund) return
    // Clear fund fields when fund doesn't exist
  }, [data?.fund])

  if (!data?.fund || !data.snapshot) return null

  const snapshot = data.snapshot

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{t('freelySpendable')}:</span>{' '}
        {formatCurrency(currency, snapshot.freelySpendable, locale)}
        {' · '}
        <span className="font-medium text-foreground">{t('remaining')}:</span>{' '}
        {formatCurrency(currency, snapshot.remaining, locale)}
        {snapshot.totalReserved > 0 && (
          <>
            {' · '}
            <span className="font-medium text-foreground">{t('reserved')}:</span>{' '}
            {formatCurrency(currency, snapshot.totalReserved, locale)}
          </>
        )}
      </div>

      {data.fund.budgets.length > 0 && (
        <FormField
          control={form.control}
          name="budgetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('budgetAllocation')}</FormLabel>
              <Select
                value={field.value ?? 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectBudget')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t('noBudget')}</SelectItem>
                  {data.fund.budgets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {data.fund.reserves.filter((r) => !r.releasedAt).length > 0 && (
        <FormField
          control={form.control}
          name="reserveId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('consumeReserve')}</FormLabel>
              <Select
                value={field.value ?? 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectReserve')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t('noReserve')}</SelectItem>
                  {data.fund.reserves
                    .filter((r) => !r.releasedAt)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.purpose}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {impact?.warnings && impact.warnings.length > 0 && (
        <div className="text-sm text-amber-600 space-y-1">
          {impact.warnings.map((w, i) => (
            <p key={i}>⚠️ {w}</p>
          ))}
        </div>
      )}
    </div>
  )
}
