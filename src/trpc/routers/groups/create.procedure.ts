import { createGroup } from '@/lib/api'
import {
  createMembershipForNewGroup,
  touchRecentGroup,
} from '@/lib/preferences-server'
import { upsertUserFromClerk } from '@/lib/users'
import { groupFormSchema } from '@/lib/schemas'
import { baseProcedure } from '@/trpc/init'
import { currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'

export const createGroupProcedure = baseProcedure
  .input(
    z.object({
      groupFormValues: groupFormSchema,
      creatorParticipantName: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input: { groupFormValues, creatorParticipantName } }) => {
    const group = await createGroup(groupFormValues)

    if (ctx.userId) {
      const clerkUser = await currentUser()
      if (clerkUser) {
        await upsertUserFromClerk({
          id: clerkUser.id,
          emailAddresses: clerkUser.emailAddresses.map((e) => ({
            emailAddress: e.emailAddress,
          })),
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        })
      }

      await touchRecentGroup(ctx.userId, group.id)

      if (creatorParticipantName) {
        const participant = group.participants.find(
          (p) => p.name === creatorParticipantName,
        )
        if (participant) {
          await createMembershipForNewGroup(
            ctx.userId,
            group.id,
            participant.id,
          )
        }
      }
    }

    return { groupId: group.id, participants: group.participants }
  })
