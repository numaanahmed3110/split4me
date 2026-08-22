import { createOrUpdateFund } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateFundProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      targetAmount: z.number().int().positive(),
    }),
  )
  .mutation(async ({ input: { groupId, targetAmount } }) => {
    const fund = await createOrUpdateFund(groupId, targetAmount)
    return { fundId: fund.id, targetAmount: fund.targetAmount }
  })
