import { createTRPCRouter } from '@/trpc/init'
import { createBudgetProcedure } from '@/trpc/routers/groups/fund/create-budget.procedure'
import { createFundProcedure } from '@/trpc/routers/groups/fund/create-fund.procedure'
import { createReserveProcedure } from '@/trpc/routers/groups/fund/create-reserve.procedure'
import { deleteBudgetProcedure } from '@/trpc/routers/groups/fund/delete-budget.procedure'
import { getHistoryProcedure } from '@/trpc/routers/groups/fund/get-history.procedure'
import { getSnapshotProcedure } from '@/trpc/routers/groups/fund/get-snapshot.procedure'
import { previewExpenseProcedure } from '@/trpc/routers/groups/fund/preview-expense.procedure'
import { releaseReserveProcedure } from '@/trpc/routers/groups/fund/release-reserve.procedure'
import { updateBudgetProcedure } from '@/trpc/routers/groups/fund/update-budget.procedure'
import { updateFundProcedure } from '@/trpc/routers/groups/fund/update-fund.procedure'
import { updateReserveProcedure } from '@/trpc/routers/groups/fund/update-reserve.procedure'

export const groupFundRouter = createTRPCRouter({
  getSnapshot: getSnapshotProcedure,
  getHistory: getHistoryProcedure,
  create: createFundProcedure,
  update: updateFundProcedure,
  createBudget: createBudgetProcedure,
  updateBudget: updateBudgetProcedure,
  deleteBudget: deleteBudgetProcedure,
  createReserve: createReserveProcedure,
  updateReserve: updateReserveProcedure,
  releaseReserve: releaseReserveProcedure,
  previewExpense: previewExpenseProcedure,
})
