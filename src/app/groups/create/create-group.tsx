'use client'

import { GroupForm } from '@/components/group-form'
import { getErrorMessage, toastError, toastSuccess } from '@/lib/toast-feedback'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'

export const CreateGroup = ({
  defaultCurrencyCode,
}: {
  defaultCurrencyCode: string
}) => {
  const { mutateAsync } = trpc.groups.create.useMutation()
  const utils = trpc.useUtils()
  const router = useRouter()

  return (
    <GroupForm
      defaultCurrencyCode={defaultCurrencyCode}
      onSubmit={async (groupFormValues) => {
        try {
          const activeUserName =
            typeof window !== 'undefined'
              ? (localStorage.getItem('newGroup-activeUser') ?? undefined)
              : undefined
          const { groupId } = await mutateAsync({
            groupFormValues,
            creatorParticipantName: activeUserName ?? undefined,
          })
          await utils.groups.invalidate()
          toastSuccess('Trip created', `"${groupFormValues.name}" is ready.`)
          // `newGroup-activeUser` is deliberately left in place: the expenses
          // page promotes it to `<groupId>-activeUser` on mount (see
          // expense-list.tsx) and clears it there. Removing it here meant the
          // promotion found nothing, so the group we just created had no active
          // user and the "Who are you?" modal reopened immediately -- asking the
          // creator to identify themselves again, and (being aria-modal) hiding
          // the rest of the page from assistive technology.
          router.push(`/groups/${groupId}`)
        } catch (error) {
          toastError(
            'Could not create trip',
            getErrorMessage(error, 'Something went wrong.'),
          )
        }
      }}
    />
  )
}
