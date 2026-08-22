import { ensureFundForGroup, getFundForGroup } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const createFundProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      targetAmount: z.number().int().positive(),
    }),
  )
  .mutation(async ({ input: { groupId, targetAmount } }) => {
    const existing = await getFundForGroup(groupId)
    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Trip budget already exists. Use update instead.',
      })
    }
    const fund = await ensureFundForGroup(groupId, targetAmount)
    return { fundId: fund.id }
  })
