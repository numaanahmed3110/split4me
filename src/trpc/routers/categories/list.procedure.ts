import { getCategories } from '@/lib/api'
import { protectedProcedure } from '@/trpc/init'

export const listCategoriesProcedure = protectedProcedure.query(async () => {
  return { categories: await getCategories() }
})
