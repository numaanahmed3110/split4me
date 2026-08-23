'use client'
import {
  BudgetWarningDialog,
  parseBudgetWarning,
} from '@/components/budget-warning-dialog'
import { RuntimeFeatureFlags } from '@/lib/featureFlags'
import { useActiveUserReady } from '@/lib/hooks'
import type { ExpenseFormValues } from '@/lib/schemas'
import { getErrorMessage, toastError, toastSuccess } from '@/lib/toast-feedback'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ExpenseForm } from './expense-form'

export function CreateExpenseForm({
  groupId,
  runtimeFeatureFlags,
}: {
  groupId: string
  expenseId?: string
  runtimeFeatureFlags: RuntimeFeatureFlags
}) {
  const { data: groupData } = trpc.groups.get.useQuery({ groupId })
  const group = groupData?.group

  const { data: categoriesData } = trpc.categories.list.useQuery()
  const categories = categoriesData?.categories

  const { mutateAsync: createExpenseMutateAsync } =
    trpc.groups.expenses.create.useMutation()

  const utils = trpc.useUtils()
  const router = useRouter()

  const [warningOpen, setWarningOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<{
    values: ExpenseFormValues
    participantId?: string
  } | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [warningMeta, setWarningMeta] = useState<{
    freelySpendable?: number
    exceedsBy?: number
  }>({})

  const activeUserReady = useActiveUserReady(groupId)

  const submitExpense = async (
    expenseFormValues: ExpenseFormValues,
    participantId?: string,
    ignoreWarning = false,
  ) => {
    await createExpenseMutateAsync({
      groupId,
      expenseFormValues: {
        ...expenseFormValues,
        ignoreBudgetWarning: ignoreWarning,
      },
      participantId,
    })
    utils.groups.expenses.invalidate()
    utils.groups.fund.invalidate()
    toastSuccess('Expense added', `"${expenseFormValues.title}" was saved.`)
    router.push(`/groups/${groupId}`)
  }

  if (!group || !categories || !activeUserReady) return null

  return (
    <>
      <ExpenseForm
        group={group}
        categories={categories}
        onSubmit={async (expenseFormValues, participantId) => {
          try {
            await submitExpense(expenseFormValues, participantId)
          } catch (error) {
            const parsed = parseBudgetWarning(error)
            if (parsed) {
              setWarnings(parsed.warnings)
              setWarningMeta({
                freelySpendable: parsed.impact?.current?.freelySpendable,
                exceedsBy: parsed.impact?.exceedsFreelySpendableBy,
              })
              setPendingSubmit({ values: expenseFormValues, participantId })
              setWarningOpen(true)
              return
            }
            toastError(
              'Could not add expense',
              getErrorMessage(error, 'Something went wrong.'),
            )
          }
        }}
        runtimeFeatureFlags={runtimeFeatureFlags}
      />
      <BudgetWarningDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        warnings={warnings}
        freelySpendable={warningMeta.freelySpendable}
        exceedsBy={warningMeta.exceedsBy}
        group={group}
        onConfirm={async () => {
          if (!pendingSubmit) return
          setWarningOpen(false)
          try {
            await submitExpense(
              pendingSubmit.values,
              pendingSubmit.participantId,
              true,
            )
          } catch (error) {
            toastError(
              'Could not add expense',
              getErrorMessage(error, 'Something went wrong.'),
            )
          }
        }}
      />
    </>
  )
}
