import { getLedgerHistory } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getHistoryProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      limit: z.number().int().min(1).max(100).optional(),
    }),
  )
  .query(async ({ input: { groupId, limit } }) => {
    return getLedgerHistory(groupId, { limit })
  })
