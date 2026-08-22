import {
  getDefaultSplitJson,
  getMembership,
  joinGroupAsParticipant,
  listUserGroupPreferences,
  migrateLocalPreferences,
  setDefaultSplitJson,
  setGroupArchived,
  setGroupStarred,
  setMembership,
  touchRecentGroup,
} from '@/lib/preferences-server'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const preferencesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await listUserGroupPreferences(ctx.userId)
    return {
      groups: prefs
        .filter((p) => p.recentOrder !== null)
        .sort((a, b) => (a.recentOrder ?? 0) - (b.recentOrder ?? 0))
        .map((p) => ({
          id: p.group.id,
          name: p.group.name,
          starred: p.starred,
          archived: p.archived,
        })),
      starredGroupIds: prefs.filter((p) => p.starred).map((p) => p.groupId),
      archivedGroupIds: prefs.filter((p) => p.archived).map((p) => p.groupId),
    }
  }),

  touchRecent: protectedProcedure
    .input(z.object({ groupId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await touchRecentGroup(ctx.userId, input.groupId)
      return { ok: true }
    }),

  setStarred: protectedProcedure
    .input(z.object({ groupId: z.string(), starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await setGroupStarred(ctx.userId, input.groupId, input.starred)
      return { ok: true }
    }),

  setArchived: protectedProcedure
    .input(z.object({ groupId: z.string(), archived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await setGroupArchived(ctx.userId, input.groupId, input.archived)
      return { ok: true }
    }),

  getMembership: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await getMembership(ctx.userId, input.groupId)
      return { participantId: membership?.participantId ?? null }
    }),

  setMembership: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        participantId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.participantId) {
        try {
          await joinGroupAsParticipant(
            ctx.userId,
            input.groupId,
            input.participantId,
          )
        } catch (error) {
          // Two people picking the same participant is an ordinary mistake in a
          // shared group, not a server fault. Left as a bare Error it surfaced
          // as a 500 INTERNAL_SERVER_ERROR, which is both wrong for the client
          // and noise in error monitoring.
          const message =
            error instanceof Error ? error.message : 'Could not join the group.'
          throw new TRPCError({
            code: message.includes('already claimed')
              ? 'CONFLICT'
              : 'BAD_REQUEST',
            message,
          })
        }
      } else {
        await setMembership(ctx.userId, input.groupId, null)
      }
      return { ok: true }
    }),

  getDefaultSplit: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const json = await getDefaultSplitJson(ctx.userId, input.groupId)
      return { defaultSplitJson: json }
    }),

  setDefaultSplit: protectedProcedure
    .input(z.object({ groupId: z.string(), defaultSplitJson: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await setDefaultSplitJson(
        ctx.userId,
        input.groupId,
        input.defaultSplitJson,
      )
      return { ok: true }
    }),

  migrateFromLocal: protectedProcedure
    .input(
      z.object({
        recentGroups: z.array(z.object({ id: z.string(), name: z.string() })),
        starredGroups: z.array(z.string()),
        archivedGroups: z.array(z.string()),
        memberships: z.record(z.string(), z.string()),
        defaultSplits: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await migrateLocalPreferences(ctx.userId, input)
      return { ok: true }
    }),

  membershipsForGroups: protectedProcedure
    .input(z.object({ groupIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.groupIds.map(async (groupId) => {
          const membership = await getMembership(ctx.userId, groupId)
          return membership?.participantId
            ? { groupId, participantId: membership.participantId }
            : null
        }),
      )
      return {
        memberships: results.filter(
          (m): m is { groupId: string; participantId: string } => m !== null,
        ),
      }
    }),
})
