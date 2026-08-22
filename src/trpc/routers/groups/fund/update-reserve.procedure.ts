import { updateReserve } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateReserveProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      reserveId: z.string().min(1),
      purpose: z.string().min(1).max(100).optional(),
      amount: z.number().int().positive().optional(),
    }),
  )
  .mutation(async ({ input: { groupId, reserveId, ...data } }) => {
    await updateReserve(groupId, reserveId, data)
    return { ok: true }
  })
