'use client'

import { useCurrentGroup } from '@/app/groups/[groupId]/current-group-context'
import { LedgerAssistant } from '@/components/ledger-assistant'
import { FundPageSkeleton } from '@/components/page-skeleton'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toastError, toastSuccess } from '@/lib/toast-feedback'
import { cn, formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { Lock, PiggyBank, Plus, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

function amountToMinor(value: string): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100)
}

function alertDot(level: string) {
  switch (level) {
    case 'exhausted':
    case 'significant':
      return 'bg-red-500'
    case 'consuming':
      return 'bg-orange-400'
    case 'approaching':
      return 'bg-amber-400'
    default:
      return 'bg-emerald-500'
  }
}

export function TripFundPageClient() {
  const t = useTranslations('TripFund')
  const locale = useLocale()
  const { groupId, group } = useCurrentGroup()
  const currency = group ? getCurrencyFromGroup(group) : undefined

  const mutationError = (title: string) => (error: { message: string }) => {
    toastError(title, error.message)
  }

  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.groups.fund.getSnapshot.useQuery({ groupId })
  const { data: history } = trpc.groups.fund.getHistory.useQuery({
    groupId,
    limit: 30,
  })

  const createFund = trpc.groups.fund.create.useMutation({
    onSuccess: () => {
      utils.groups.fund.invalidate()
      toastSuccess('Trip budget created', 'Your budget is ready.')
    },
    onError: mutationError('Could not create budget'),
  })
  const updateFund = trpc.groups.fund.update.useMutation({
    onSuccess: () => {
      utils.groups.fund.invalidate()
      toastSuccess('Budget updated', 'Trip budget saved.')
    },
    onError: mutationError('Could not update budget'),
  })
  const createBudget = trpc.groups.fund.createBudget.useMutation({
    onSuccess: () => {
      utils.groups.fund.invalidate()
      toastSuccess('Allocation added', 'Budget category saved.')
    },
    onError: mutationError('Could not add allocation'),
  })
  const deleteBudget = trpc.groups.fund.deleteBudget.useMutation({
    onSuccess: () => {
      utils.groups.fund.invalidate()
      toastSuccess('Allocation removed')
    },
    onError: mutationError('Could not remove allocation'),
  })
  const createReserve = trpc.groups.fund.createReserve.useMutation({
    onSuccess: () => {
      utils.groups.fund.invalidate()
      toastSuccess('Reserve created', 'Money set aside.')
    },
    onError: mutationError('Could not create reserve'),
  })
  const releaseReserve = trpc.groups.fund.releaseReserve.useMutation({
    onSuccess: () => {
      utils.groups.fund.invalidate()
      toastSuccess('Reserve released', 'Funds returned to spendable budget.')
    },
    onError: mutationError('Could not release reserve'),
  })

  const [budgetDialog, setBudgetDialog] = useState(false)
  const [reserveDialog, setReserveDialog] = useState(false)
  const [fundDialog, setFundDialog] = useState(false)
  const [budgetName, setBudgetName] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [reservePurpose, setReservePurpose] = useState('')
  const [reserveAmount, setReserveAmount] = useState('')
  const [fundAmount, setFundAmount] = useState('')

  if (!group || !currency) return null

  const snapshot = data?.snapshot
  const fund = data?.fund

  const openCreateFund = () => {
    setFundAmount('')
    setFundDialog(true)
  }

  const handleSaveFund = async () => {
    const amount = amountToMinor(fundAmount)
    if (!amount) return
    if (fund) {
      await updateFund.mutateAsync({ groupId, targetAmount: amount })
    } else {
      await createFund.mutateAsync({ groupId, targetAmount: amount })
    }
    setFundDialog(false)
  }

  if (isLoading) {
    return <FundPageSkeleton />
  }

  if (!fund || !snapshot) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('noBudgetDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openCreateFund}>
            <PiggyBank className="w-4 h-4 mr-2" />
            {t('createBudget')}
          </Button>
          <FundDialog
            open={fundDialog}
            onOpenChange={setFundDialog}
            title={t('createBudget')}
            amount={fundAmount}
            onAmountChange={setFundAmount}
            onSave={handleSaveFund}
            currencyLabel={currency.code || group.currency}
          />
        </CardContent>
      </Card>
    )
  }

  const statusLabel = snapshot.withinBudget
    ? t('status.withinBudget')
    : t('status.overBudget', {
        amount: formatCurrency(currency, snapshot.overBudget, locale),
      })

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              {t('tripFund')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFundAmount((snapshot.targetAmount / 100).toString())
                setFundDialog(true)
              }}
            >
              {t('editBudget')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-800 dark:text-emerald-300 font-medium">
              {t('freelySpendable')}
            </p>
            <p className="text-3xl font-semibold tabular-nums mt-1">
              {formatCurrency(currency, snapshot.freelySpendable, locale)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('safeToSpendHint')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat
              label={t('totalBudget')}
              value={formatCurrency(currency, snapshot.targetAmount, locale)}
            />
            <Stat
              label={t('spent')}
              value={formatCurrency(currency, snapshot.totalSpent, locale)}
            />
            <Stat
              label={t('remaining')}
              value={formatCurrency(currency, snapshot.remaining, locale)}
            />
            <Stat
              label={t('reserved')}
              value={formatCurrency(currency, snapshot.totalReserved, locale)}
              icon={<Lock className="w-3 h-3" />}
            />
          </div>

          {snapshot.totalReserved > 0 && (
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-3 py-2">
              {t('lockedHint', {
                amount: formatCurrency(
                  currency,
                  snapshot.totalReserved,
                  locale,
                ),
              })}
            </p>
          )}

          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{t('used')}</span>
              <span>{snapshot.percentConsumed.toFixed(0)}%</span>
            </div>
            <Progress
              value={Math.min(100, snapshot.percentConsumed)}
              className="h-2"
            />
          </div>

          <p
            className={cn(
              'text-sm font-medium',
              snapshot.withinBudget ? 'text-green-700' : 'text-red-600',
            )}
          >
            <span
              className={cn(
                'inline-block w-2 h-2 rounded-full mr-2 align-middle',
                alertDot(snapshot.overallAlertLevel),
              )}
            />
            {statusLabel}
          </p>

          {snapshot.consumedFromReserves > 0 && (
            <p className="text-sm text-amber-600">
              {t('reserveConsumed', {
                amount: formatCurrency(
                  currency,
                  snapshot.consumedFromReserves,
                  locale,
                ),
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t('allocations')}</CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">
                {t('allocationsHint')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBudgetDialog(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.budgets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('noAllocations')}
            </p>
          ) : (
            snapshot.budgets.map((b) => (
              <div key={b.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span>
                    {formatCurrency(currency, b.spent, locale)} /{' '}
                    {formatCurrency(currency, b.allocatedAmount, locale)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, b.percentConsumed)}
                  className="h-1.5"
                />
                {b.overAllocation && (
                  <p className="text-xs text-red-600">{t('overAllocation')}</p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    deleteBudget.mutateAsync({ groupId, budgetId: b.id })
                  }
                >
                  <Trash2 className="w-3 h-3 mr-1" /> {t('delete')}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t('reserves')}</CardTitle>
              <p className="text-xs text-muted-foreground font-normal mt-1">
                {t('reservesHint')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReserveDialog(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.reserves.filter((r) => !r.released).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noReserves')}</p>
          ) : (
            snapshot.reserves
              .filter((r) => !r.released)
              .map((r) => (
                <div key={r.id} className="rounded border p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {r.purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(currency, r.remaining, locale)}{' '}
                        {t('remaining')}
                        {' · '}
                        {r.percentConsumed.toFixed(0)}% {t('used')}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-block w-2.5 h-2.5 rounded-full',
                        alertDot(r.alertLevel),
                      )}
                    />
                  </div>
                  <Progress
                    value={Math.min(100, r.percentConsumed)}
                    className="h-1.5"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      releaseReserve.mutateAsync({ groupId, reserveId: r.id })
                    }
                  >
                    {t('releaseReserve')}
                  </Button>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      <LedgerAssistant groupId={groupId} />

      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('history')}</CardTitle>
            <CardDescription>
              Every budget, lock, and expense that changed this trip&apos;s
              money.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between gap-2 border-b pb-2"
                >
                  <span className="truncate">{entry.label}</span>
                  {entry.amount !== undefined && (
                    <span
                      className={cn(
                        'shrink-0',
                        entry.amount < 0 ? 'text-red-600' : 'text-green-600',
                      )}
                    >
                      {entry.amount > 0 ? '+' : ''}
                      {formatCurrency(currency, Math.abs(entry.amount), locale)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <BudgetDialog
        open={budgetDialog}
        onOpenChange={setBudgetDialog}
        name={budgetName}
        amount={budgetAmount}
        onNameChange={setBudgetName}
        onAmountChange={setBudgetAmount}
        onSave={async () => {
          const amt = amountToMinor(budgetAmount)
          if (!budgetName || !amt) return
          await createBudget.mutateAsync({
            groupId,
            name: budgetName,
            allocatedAmount: amt,
          })
          setBudgetDialog(false)
          setBudgetName('')
          setBudgetAmount('')
        }}
      />

      <ReserveDialog
        open={reserveDialog}
        onOpenChange={setReserveDialog}
        purpose={reservePurpose}
        amount={reserveAmount}
        onPurposeChange={setReservePurpose}
        onAmountChange={setReserveAmount}
        freelySpendable={snapshot.freelySpendable}
        currency={currency}
        locale={locale}
        onSave={async () => {
          const amt = amountToMinor(reserveAmount)
          if (!reservePurpose || !amt) return
          await createReserve.mutateAsync({
            groupId,
            purpose: reservePurpose,
            amount: amt,
          })
          setReserveDialog(false)
          setReservePurpose('')
          setReserveAmount('')
        }}
      />

      <FundDialog
        open={fundDialog}
        onOpenChange={setFundDialog}
        title={t('editBudget')}
        amount={fundAmount}
        onAmountChange={setFundAmount}
        onSave={handleSaveFund}
        currencyLabel={currency.code || group.currency}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
  icon,
}: {
  label: string
  value: string
  highlight?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={cn('font-semibold', highlight && 'text-primary')}>
        {value}
      </p>
    </div>
  )
}

function FundDialog({
  open,
  onOpenChange,
  title,
  amount,
  onAmountChange,
  onSave,
  currencyLabel,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  amount: string
  onAmountChange: (v: string) => void
  onSave: () => void
  currencyLabel: string
}) {
  const t = useTranslations('TripFund')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>
            {t('amount')} ({currencyLabel})
          </Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={onSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BudgetDialog({
  open,
  onOpenChange,
  name,
  amount,
  onNameChange,
  onAmountChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  name: string
  amount: string
  onNameChange: (v: string) => void
  onAmountChange: (v: string) => void
  onSave: () => void
}) {
  const t = useTranslations('TripFund')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addAllocation')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t('name')}</Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('amount')}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReserveDialog({
  open,
  onOpenChange,
  purpose,
  amount,
  onPurposeChange,
  onAmountChange,
  freelySpendable,
  currency,
  locale,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  purpose: string
  amount: string
  onPurposeChange: (v: string) => void
  onAmountChange: (v: string) => void
  freelySpendable: number
  currency: ReturnType<typeof getCurrencyFromGroup>
  locale: string
  onSave: () => void
}) {
  const t = useTranslations('TripFund')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addReserve')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t('freelySpendable')}:{' '}
          {formatCurrency(currency, freelySpendable, locale)}
        </p>
        <div className="space-y-3">
          <div>
            <Label>{t('purpose')}</Label>
            <Input
              value={purpose}
              onChange={(e) => onPurposeChange(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('amount')}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
