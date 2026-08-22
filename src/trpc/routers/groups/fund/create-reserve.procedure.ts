import { createReserve } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createReserveProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      purpose: z.string().min(1).max(100),
      amount: z.number().int().positive(),
    }),
  )
  .mutation(async ({ input }) => {
    const reserve = await createReserve(input.groupId, {
      purpose: input.purpose,
      amount: input.amount,
    })
    return { reserveId: reserve.id }
  })
