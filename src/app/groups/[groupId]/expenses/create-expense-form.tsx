'use client'
import { RuntimeFeatureFlags } from '@/lib/featureFlags'
import { useActiveUserReady } from '@/lib/hooks'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
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

  // ExpenseForm seeds "Paid by" from the active participant, and it can only do
  // that on the render that mounts it. Signed in, that value arrives from a tRPC
  // query, so mounting early leaves "Paid by" empty for good.
  const activeUserReady = useActiveUserReady(groupId)

  if (!group || !categories || !activeUserReady) return null

  return (
    <ExpenseForm
      group={group}
      categories={categories}
      onSubmit={async (expenseFormValues, participantId) => {
        await createExpenseMutateAsync({
          groupId,
          expenseFormValues,
          participantId,
        })
        utils.groups.expenses.invalidate()
        router.push(`/groups/${group.id}`)
      }}
      runtimeFeatureFlags={runtimeFeatureFlags}
    />
  )
}
