import { Prisma } from '@/generated/prisma/client'
import { upsertUserFromClerk } from '@/lib/users'
import { auth, currentUser } from '@clerk/nextjs/server'
import { initTRPC, TRPCError } from '@trpc/server'
import { cache } from 'react'
import superjson from 'superjson'

superjson.registerCustom<Prisma.Decimal, string>(
  {
    isApplicable: (v): v is Prisma.Decimal => Prisma.Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Prisma.Decimal(v),
  },
  'decimal.js',
)

export const createTRPCContext = cache(async () => {
  const session = await auth()
  return {
    userId: session.userId,
  }
})

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const baseProcedure = t.procedure

/** Requires a signed-in Clerk user and ensures a DB User row exists. */
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

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

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  })
})
