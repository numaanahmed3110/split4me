import { releaseReserve } from '@/lib/fund'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const releaseReserveProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      reserveId: z.string().min(1),
    }),
  )
  .mutation(async ({ input: { groupId, reserveId } }) => {
    await releaseReserve(groupId, reserveId)
    return { ok: true }
  })
