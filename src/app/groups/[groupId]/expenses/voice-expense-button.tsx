'use client'

import { ExpenseDraftReview } from '@/components/expense-draft-review'
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
import { useToast } from '@/components/ui/use-toast'
import type { ExpenseDraftPayload } from '@/lib/draft-schemas'
import { useMediaQuery } from '@/lib/hooks'
import { trpc } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { Loader2, Mic, Square } from 'lucide-react'
import { PropsWithChildren, ReactNode, useRef, useState } from 'react'
import { useCurrentGroup } from '../current-group-context'

type Step = 'idle' | 'recording' | 'processing' | 'review'

export function VoiceExpenseButton() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const Shell = isDesktop ? VoiceDialog : VoiceDrawer

  return (
    <Shell
      trigger={
        <Button size="icon" variant="secondary" title="Add expense by voice">
          <Mic className="w-4 h-4" />
        </Button>
      }
      title={
        <>
          <span>Voice expense</span>
          <Badge className="bg-violet-700 hover:bg-violet-600">Beta</Badge>
        </>
      }
      description="Describe what you paid for and who shared it. We'll draft the expense for you."
    >
      <VoiceExpenseContent />
    </Shell>
  )
}

function VoiceExpenseContent() {
  const { groupId, group } = useCurrentGroup()
  const { isSignedIn } = useAuth()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [step, setStep] = useState<Step>('idle')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [payload, setPayload] = useState<ExpenseDraftPayload | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const createDraft = trpc.drafts.create.useMutation()

  const startRecording = async () => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to use voice expense entry.',
        variant: 'destructive',
      })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processRecording(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setStep('recording')
    } catch {
      toast({
        title: 'Microphone unavailable',
        description: 'Allow microphone access to record a voice expense.',
        variant: 'destructive',
      })
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setStep('processing')
  }

  const processRecording = async (blob: Blob) => {
    if (!group) return

    try {
      const formData = new FormData()
      formData.append('groupId', groupId)
      formData.append('audio', blob, 'recording.webm')

      const membership = await utils.preferences.getMembership.fetch({ groupId })
      if (membership.participantId) {
        formData.append('payerParticipantId', membership.participantId)
      }

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as {
        transcript?: string
        draft?: ExpenseDraftPayload
        error?: string
      }

      if (!response.ok || !data.draft) {
        throw new Error(data.error ?? 'Could not parse voice expense')
      }

      setTranscript(data.transcript ?? null)
      const created = await createDraft.mutateAsync({
        groupId,
        payload: data.draft,
      })
      setDraftId(created.draftId)
      setPayload(data.draft)
      setStep('review')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Voice parsing failed',
        description:
          err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
      setStep('idle')
    }
  }

  if (step === 'review' && draftId && payload && group) {
    return (
      <ExpenseDraftReview
        groupId={groupId}
        group={group}
        draftId={draftId}
        initialPayload={payload}
        source="voice"
        onCancel={() => {
          setStep('idle')
          setDraftId(null)
          setPayload(null)
          setTranscript(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6 py-2">
      <div className="rounded-xl border bg-gradient-to-b from-violet-50 to-background dark:from-violet-950/30 p-6 text-center space-y-4">
        <div
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
            step === 'recording'
              ? 'bg-red-100 dark:bg-red-950 animate-pulse'
              : 'bg-violet-100 dark:bg-violet-950'
          }`}
        >
          {step === 'processing' ? (
            <Loader2 className="w-8 h-8 animate-spin text-violet-700" />
          ) : step === 'recording' ? (
            <Square className="w-7 h-7 text-red-600" />
          ) : (
            <Mic className="w-8 h-8 text-violet-700" />
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium">
            {step === 'recording'
              ? 'Listening…'
              : step === 'processing'
                ? 'Understanding your expense…'
                : 'Tap to describe your expense'}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Example: &ldquo;I paid 45 dollars for dinner. Alice and I shared the
            pasta, Bob had the steak.&rdquo;
          </p>
        </div>

        {step === 'recording' ? (
          <Button variant="destructive" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2" />
            Stop recording
          </Button>
        ) : step === 'processing' ? null : (
          <Button onClick={startRecording} disabled={!group}>
            <Mic className="w-4 h-4 mr-2" />
            Start recording
          </Button>
        )}
      </div>

      {transcript && step === 'idle' && (
        <p className="text-sm text-muted-foreground">
          Last transcript: {transcript}
        </p>
      )}
    </div>
  )
}

function VoiceDialog({
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
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function VoiceDrawer({
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
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
