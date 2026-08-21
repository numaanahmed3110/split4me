'use client'

import { ExpenseDraftReview } from '@/components/expense-draft-review'
import { extractExpenseInformationFromImage } from '@/app/groups/[groupId]/expenses/create-from-receipt-button-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { useAnalytics } from '@/lib/analytics/context'
import { useMediaQuery } from '@/lib/hooks'
import { formatFileSize } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { FileQuestion, Loader2, Receipt, Upload } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { PropsWithChildren, ReactNode, useRef, useState } from 'react'
import { useCurrentGroup } from '../current-group-context'

const MAX_FILE_SIZE = 5 * 1024 ** 2

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function CreateFromReceiptButton() {
  const t = useTranslations('CreateFromReceipt')
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const Shell = isDesktop ? CreateFromReceiptDialog : CreateFromReceiptDrawer

  return (
    <Shell
      trigger={
        <Button
          size="icon"
          variant="secondary"
          title={t('Dialog.triggerTitle')}
        >
          <Receipt className="w-4 h-4" />
        </Button>
      }
      title={
        <>
          <span>{t('Dialog.title')}</span>
          <Badge className="bg-pink-700 hover:bg-pink-600 dark:bg-pink-500 dark:hover:bg-pink-600">
            Beta
          </Badge>
        </>
      }
      description={<>{t('Dialog.description')}</>}
    >
      <ReceiptDialogContent />
    </Shell>
  )
}

function ReceiptDialogContent() {
  const { groupId, group } = useCurrentGroup()
  const { isSignedIn } = useAuth()
  const sendEvent = useAnalytics()
  const locale = useLocale()
  const t = useTranslations('CreateFromReceipt')
  const [pending, setPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const createDraft = trpc.drafts.create.useMutation()

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [draftPayload, setDraftPayload] = useState<
    import('@/lib/draft-schemas').ExpenseDraftPayload | null
  >(null)

  const handleFileChange = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t('TooBigToast.title'),
        description: t('TooBigToast.description', {
          maxSize: formatFileSize(MAX_FILE_SIZE, locale),
          size: formatFileSize(file.size, locale),
        }),
        variant: 'destructive',
      })
      return
    }

    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to scan receipts.',
        variant: 'destructive',
      })
      return
    }

    const process = async () => {
      sendEvent(
        { event: 'expense: scan receipt', props: {} },
        `/groups/${groupId}/expenses`,
      )
      try {
        setPending(true)
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        const dataUrl = await readFileAsDataUrl(file)
        const membership = await utils.preferences.getMembership.fetch({
          groupId,
        })

        const extracted = await extractExpenseInformationFromImage(
          groupId,
          dataUrl,
          membership.participantId ?? undefined,
        )

        if (!extracted.draft) {
          toast({
            title: t('ErrorToast.title'),
            description: 'Could not read anything from this receipt.',
            variant: 'destructive',
          })
          return
        }

        const created = await createDraft.mutateAsync({
          groupId,
          payload: extracted.draft,
        })
        setDraftId(created.draftId)
        setDraftPayload(extracted.draft)
      } catch (err) {
        console.error(err)
        toast({
          title: t('ErrorToast.title'),
          description: t('ErrorToast.description'),
          variant: 'destructive',
          action: (
            <ToastAction altText={t('ErrorToast.retry')} onClick={() => process()}>
              {t('ErrorToast.retry')}
            </ToastAction>
          ),
        })
      } finally {
        setPending(false)
      }
    }
    process()
  }

  if (draftId && draftPayload && group) {
    return (
      <ExpenseDraftReview
        groupId={groupId}
        group={group}
        draftId={draftId}
        initialPayload={draftPayload}
        previewImageUrl={previewUrl ?? undefined}
        source="receipt"
        onCancel={() => {
          setDraftId(null)
          setDraftPayload(null)
          if (previewUrl) URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }}
      />
    )
  }

  return (
    <div className="prose prose-sm dark:prose-invert">
      <p>{t('Dialog.body')}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileChange(file)
          e.target.value = ''
        }}
      />
      <div className="not-prose">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="w-full rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors p-8 flex flex-col items-center gap-3 text-center"
        >
          {pending ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Analyzing receipt…</span>
              <span className="text-xs text-muted-foreground">
                Sending image to AI — nothing is stored
              </span>
            </>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Receipt"
              className="max-h-40 object-contain"
            />
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <Upload className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="font-medium text-sm">Upload receipt photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG or PNG, up to {formatFileSize(MAX_FILE_SIZE, locale)}
                </p>
              </div>
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
          <FileQuestion className="w-3.5 h-3.5" />
          Image is sent directly to AI for extraction — not saved to cloud storage
        </p>
      </div>
    </div>
  )
}

function CreateFromReceiptDialog({
  trigger,
  title,
  description,
  children,
}: PropsWithChildren<{
  trigger: ReactNode
  title: ReactNode
  description: ReactNode
}>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CreateFromReceiptDrawer({
  trigger,
  title,
  description,
  children,
}: PropsWithChildren<{
  trigger: ReactNode
  title: ReactNode
  description: ReactNode
}>) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">{title}</DrawerTitle>
          <DrawerDescription className="text-left">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
