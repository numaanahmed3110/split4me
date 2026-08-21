import { categoriesRouter } from '@/trpc/routers/categories'
import { draftsRouter } from '@/trpc/routers/drafts'
import { groupsRouter } from '@/trpc/routers/groups'
import { preferencesRouter } from '@/trpc/routers/preferences'
import { inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
  groups: groupsRouter,
  categories: categoriesRouter,
  drafts: draftsRouter,
  preferences: preferencesRouter,
})

export type AppRouter = typeof appRouter
export type AppRouterOutput = inferRouterOutputs<AppRouter>
