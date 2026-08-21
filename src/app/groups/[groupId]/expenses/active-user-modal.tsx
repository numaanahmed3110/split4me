'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useMediaQuery } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { useTranslations } from 'next-intl'
import { ComponentProps, useEffect, useState } from 'react'

export function ActiveUserModal({ groupId }: { groupId: string }) {
  const t = useTranslations('Expenses.ActiveUserModal')
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { isSignedIn } = useAuth()
  const { data: groupData } = trpc.groups.get.useQuery({ groupId })

  const group = groupData?.group

  useEffect(() => {
    if (!group) return
    const tempUser = localStorage.getItem(`newGroup-activeUser`)
    const stored = localStorage.getItem(`${group.id}-activeUser`)
    // expense-list promotes newGroup-activeUser → groupId-activeUser on mount
    if (tempUser) return
    if (!stored) setOpen(true)
  }, [group])

  function updateOpen(open: boolean) {
    setOpen(open)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={updateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <ActiveUserForm
            group={group}
            groupId={groupId}
            isSignedIn={!!isSignedIn}
            close={() => setOpen(false)}
          />
          <DialogFooter className="sm:justify-center">
            <p className="text-sm text-center text-muted-foreground">
              {t('footer')}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={updateOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('title')}</DrawerTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DrawerHeader>
        <ActiveUserForm
          className="px-4"
          group={group}
          groupId={groupId}
          isSignedIn={!!isSignedIn}
          close={() => setOpen(false)}
        />
        <DrawerFooter className="pt-2">
          <p className="text-sm text-center text-muted-foreground">
            {t('footer')}
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ActiveUserForm({
  group,
  groupId,
  isSignedIn,
  close,
  className,
}: ComponentProps<'form'> & {
  group?: AppRouterOutput['groups']['get']['group']
  groupId: string
  isSignedIn: boolean
  close: () => void
}) {
  const t = useTranslations('Expenses.ActiveUserModal')
  const [selected, setSelected] = useState('none')
  const setMembership = trpc.preferences.setMembership.useMutation()
  const utils = trpc.useUtils()

  return (
    <form
      className={cn('grid items-start gap-4', className)}
      onSubmit={async (event) => {
        if (!group) return

        event.preventDefault()
        const participantId = selected === 'none' ? null : selected

        if (isSignedIn) {
          await setMembership.mutateAsync({ groupId, participantId })
          await utils.preferences.getMembership.invalidate({ groupId })
        }
        localStorage.setItem(
          `${group.id}-activeUser`,
          participantId ?? 'None',
        )
        close()
      }}
    >
      <RadioGroup defaultValue="none" onValueChange={setSelected}>
        <div className="flex flex-col gap-4 my-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="italic font-normal flex-1">
              {t('nobody')}
            </Label>
          </div>
          {group?.participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2">
              <RadioGroupItem value={participant.id} id={participant.id} />
              <Label htmlFor={participant.id} className="flex-1">
                {participant.name}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
      <Button type="submit">{t('save')}</Button>
    </form>
  )
}
