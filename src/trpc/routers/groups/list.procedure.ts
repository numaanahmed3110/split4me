import { getGroups } from '@/lib/api'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const listGroupsProcedure = protectedProcedure
  .input(
    z.object({
      groupIds: z.array(z.string().min(1)),
    }),
  )
  .query(async ({ input: { groupIds } }) => {
    const groups = await getGroups(groupIds)
    return { groups }
  })
