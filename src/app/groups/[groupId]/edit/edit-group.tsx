'use client'

import { GroupForm } from '@/components/group-form'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/trpc/client'
import { useCurrentGroup } from '../current-group-context'

export const EditGroup = () => {
  const { groupId } = useCurrentGroup()
  const { data, isLoading } = trpc.groups.getDetails.useQuery({ groupId })
  const { mutateAsync } = trpc.groups.update.useMutation()
  const utils = trpc.useUtils()
  const { toast } = useToast()

  if (isLoading) return <></>

  return (
    <GroupForm
      group={data?.group}
      onSubmit={async (groupFormValues, participantId) => {
        await mutateAsync({ groupId, participantId, groupFormValues })
        await utils.groups.invalidate()
        toast({
          title: 'Changes saved',
          description: 'Trip details were updated.',
        })
      }}
      protectedParticipantIds={data?.participantsWithExpenses}
    />
  )
}
