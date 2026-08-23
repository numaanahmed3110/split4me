'use client'
import {
  BudgetWarningDialog,
  parseBudgetWarning,
} from '@/components/budget-warning-dialog'
import { useToast } from '@/components/ui/use-toast'
import { RuntimeFeatureFlags } from '@/lib/featureFlags'
import type { ExpenseFormValues } from '@/lib/schemas'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ExpenseForm } from './expense-form'

export function EditExpenseForm({
  groupId,
  expenseId,
  runtimeFeatureFlags,
}: {
  groupId: string
  expenseId: string
  runtimeFeatureFlags: RuntimeFeatureFlags
}) {
  const { data: groupData } = trpc.groups.get.useQuery({ groupId })
  const group = groupData?.group

  const { data: categoriesData } = trpc.categories.list.useQuery()
  const categories = categoriesData?.categories

  const { data: expenseData } = trpc.groups.expenses.get.useQuery({
    groupId,
    expenseId,
  })
  const expense = expenseData?.expense

  const { mutateAsync: updateExpenseMutateAsync } =
    trpc.groups.expenses.update.useMutation()
  const { mutateAsync: deleteExpenseMutateAsync } =
    trpc.groups.expenses.delete.useMutation()

  const utils = trpc.useUtils()
  const router = useRouter()
  const { toast } = useToast()

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

  const submitExpense = async (
    expenseFormValues: ExpenseFormValues,
    participantId?: string,
    ignoreWarning = false,
  ) => {
    await updateExpenseMutateAsync({
      expenseId,
      groupId,
      expenseFormValues: {
        ...expenseFormValues,
        ignoreBudgetWarning: ignoreWarning,
      },
      participantId,
    })
    utils.groups.expenses.invalidate()
    utils.groups.fund.invalidate()
    toast({
      title: 'Expense updated',
      description: `"${expenseFormValues.title}" was saved.`,
    })
    router.push(`/groups/${groupId}`)
  }

  if (!group || !categories || !expense) return null

  return (
    <>
      <ExpenseForm
        group={group}
        expense={expense}
        categories={categories}
        expenseId={expenseId}
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
            throw error
          }
        }}
        onDelete={async (participantId) => {
          await deleteExpenseMutateAsync({
            expenseId,
            groupId,
            participantId,
          })
          utils.groups.expenses.invalidate()
          utils.groups.fund.invalidate()
          toast({
            title: 'Expense deleted',
            description: 'The expense was removed from this trip.',
          })
          router.push(`/groups/${groupId}`)
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
          await submitExpense(
            pendingSubmit.values,
            pendingSubmit.participantId,
            true,
          )
        }}
      />
    </>
  )
}
