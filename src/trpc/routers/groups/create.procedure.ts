import { createGroup } from '@/lib/api'
import {
  createMembershipForNewGroup,
  touchRecentGroup,
} from '@/lib/preferences-server'
import { groupFormSchema } from '@/lib/schemas'
import { upsertUserFromClerk } from '@/lib/users'
import { protectedProcedure } from '@/trpc/init'
import { currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'

export const createGroupProcedure = protectedProcedure
  .input(
    z.object({
      groupFormValues: groupFormSchema,
      creatorParticipantName: z.string().optional(),
    }),
  )
  .mutation(
    async ({ ctx, input: { groupFormValues, creatorParticipantName } }) => {
      const group = await createGroup(groupFormValues)

      // `protectedProcedure` already guarantees a signed-in user and upserts the
      // User row, so no `if (ctx.userId)` guard is needed here any more.
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

      return { groupId: group.id, participants: group.participants }
    },
  )
