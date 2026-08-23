'use client'

import { GroupForm } from '@/components/group-form'
import { getErrorMessage, toastError, toastSuccess } from '@/lib/toast-feedback'
import { trpc } from '@/trpc/client'
import { useCurrentGroup } from '../current-group-context'

export const EditGroup = () => {
  const { groupId } = useCurrentGroup()
  const { data, isLoading } = trpc.groups.getDetails.useQuery({ groupId })
  const { mutateAsync } = trpc.groups.update.useMutation()
  const utils = trpc.useUtils()

  if (isLoading) return <></>

  return (
    <GroupForm
      group={data?.group}
      onSubmit={async (groupFormValues, participantId) => {
        try {
          await mutateAsync({ groupId, participantId, groupFormValues })
          await utils.groups.invalidate()
          toastSuccess('Changes saved', 'Trip details were updated.')
        } catch (error) {
          toastError(
            'Could not save changes',
            getErrorMessage(error, 'Something went wrong.'),
          )
        }
      }}
      protectedParticipantIds={data?.participantsWithExpenses}
    />
  )
}
