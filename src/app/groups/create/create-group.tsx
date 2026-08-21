'use client'

import { GroupForm } from '@/components/group-form'
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
        const activeUserName =
          typeof window !== 'undefined'
            ? localStorage.getItem('newGroup-activeUser') ?? undefined
            : undefined
        const { groupId } = await mutateAsync({
          groupFormValues,
          creatorParticipantName: activeUserName ?? undefined,
        })
        await utils.groups.invalidate()
        if (activeUserName) {
          localStorage.removeItem('newGroup-activeUser')
        }
        router.push(`/groups/${groupId}`)
      }}
    />
  )
}
