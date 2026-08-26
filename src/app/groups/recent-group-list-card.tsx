import {
  RecentGroup,
  archiveGroup,
  deleteRecentGroup,
  starGroup,
  unarchiveGroup,
  unstarGroup,
} from '@/app/groups/recent-groups-helpers'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { StarFilledIcon } from '@radix-ui/react-icons'
import { Calendar, MoreHorizontal, Star, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STRIPES = ['bg-[#E0F4F5]', 'bg-[#E8E2FC]', 'bg-[#FDECAD]']
const BILL_TONES = [
  'bg-[#1D1C22] text-white',
  'bg-[#E0F4F5] text-[#1D1C22]',
  'bg-[#E8E2FC] text-[#1D1C22]',
  'bg-[#FDECAD] text-[#1D1C22]',
]

export function RecentGroupListCard({
  group,
  groupDetail,
  isStarred,
  isArchived,
  refreshGroupsFromStorage,
  isSignedIn,
  variant = 'card',
  featured = false,
}: {
  group: RecentGroup
  groupDetail?: AppRouterOutput['groups']['list']['groups'][number]
  isStarred: boolean
  isArchived: boolean
  refreshGroupsFromStorage: () => void
  isSignedIn: boolean
  variant?: 'card' | 'bill'
  featured?: boolean
}) {
  const router = useRouter()
  const locale = useLocale()
  const toast = useToast()
  const t = useTranslations('Groups')
  const setStarred = trpc.preferences.setStarred.useMutation()
  const setArchived = trpc.preferences.setArchived.useMutation()

  const handleStar = async (star: boolean) => {
    if (isSignedIn) {
      await setStarred.mutateAsync({ groupId: group.id, starred: star })
      if (star) {
        await setArchived.mutateAsync({ groupId: group.id, archived: false })
      }
    } else if (star) {
      starGroup(group.id)
      unarchiveGroup(group.id)
    } else {
      unstarGroup(group.id)
    }
    refreshGroupsFromStorage()
  }

  const handleArchive = async (archived: boolean) => {
    if (isSignedIn) {
      await setArchived.mutateAsync({ groupId: group.id, archived })
      if (archived) {
        await setStarred.mutateAsync({ groupId: group.id, starred: false })
      }
    } else if (archived) {
      archiveGroup(group.id)
      unstarGroup(group.id)
    } else {
      unarchiveGroup(group.id)
    }
    refreshGroupsFromStorage()
  }

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="-my-3 -mr-3 -ml-1.5 text-current"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive"
          onClick={(event) => {
            event.stopPropagation()
            deleteRecentGroup(group)
            refreshGroupsFromStorage()
            toast.toast({
              title: t('RecentRemovedToast.title'),
              description: t('RecentRemovedToast.description'),
            })
          }}
        >
          {t('removeRecent')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            void handleArchive(!isArchived)
          }}
        >
          {t(isArchived ? 'unarchive' : 'archive')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (variant === 'bill') {
    const tone =
      BILL_TONES[
        featured ? 0 : (group.id.charCodeAt(0) % (BILL_TONES.length - 1)) + 1
      ]
    const count = groupDetail?._count.participants
    return (
      <li className="snap-start shrink-0 w-[210px]">
        <button
          type="button"
          onClick={() => router.push(`/groups/${group.id}`)}
          className={cn(
            'w-full h-[220px] rounded-[28px] p-4 flex flex-col text-left shadow-[0_12px_28px_rgba(0,0,0,0.08)]',
            tone,
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-base leading-tight line-clamp-2">
              {group.name}
            </p>
            <span className="opacity-80">{menu}</span>
          </div>
          <p className="text-sm mt-3 opacity-80">
            {count
              ? t('splitWith', { count })
              : t('openGroup')}
          </p>
          <span
            className={cn(
              'mt-auto h-10 rounded-full text-sm font-semibold flex items-center justify-center',
              featured
                ? 'bg-[#E8E8E8] text-[#1D1C22]'
                : 'bg-white/70 text-[#1D1C22]',
            )}
          >
            {t('pay')}
          </span>
        </button>
      </li>
    )
  }

  return (
    <li>
      <Button
        variant="secondary"
        className="h-fit w-full p-0 rounded-[24px] border-0 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:translate-y-[-2px]"
        asChild
      >
        <div
          className="text-base"
          onClick={() => router.push(`/groups/${group.id}`)}
        >
          <div
            className={`h-16 ${STRIPES[group.id.charCodeAt(0) % STRIPES.length]}`}
          />
          <div className="w-full flex flex-col gap-1 p-4 pt-3">
            <div className="text-base flex gap-2 justify-between">
              <Link
                href={`/groups/${group.id}`}
                className="flex-1 overflow-hidden text-ellipsis"
              >
                {group.name}
              </Link>
              <span className="flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="-my-3 -ml-3 -mr-1.5"
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleStar(!isStarred)
                  }}
                >
                  {isStarred ? (
                    <StarFilledIcon className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Star className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                {menu}
              </span>
            </div>
            <div className="text-muted-foreground font-normal text-xs">
              {groupDetail ? (
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 inline mr-1" />
                    <span>{groupDetail._count.participants}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 inline mx-1" />
                    <span>
                      {new Date(groupDetail.createdAt).toLocaleDateString(
                        locale,
                        { dateStyle: 'medium' },
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Button>
    </li>
  )
}
