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
import { AlertCircle, Loader2, Mic, RotateCcw, Square } from 'lucide-react'
import { PropsWithChildren, ReactNode, useRef, useState } from 'react'
import { useCurrentGroup } from '../current-group-context'

type Step = 'idle' | 'recording' | 'processing' | 'failed' | 'review'

type TranscribeResponse = {
  transcript?: string
  draft?: ExpenseDraftPayload
  error?: string
  stage?: 'transcribe' | 'parse'
}

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [failureMessage, setFailureMessage] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [payload, setPayload] = useState<ExpenseDraftPayload | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const storedBlobRef = useRef<Blob | null>(null)
  const storedTranscriptRef = useRef<string | null>(null)

  const createDraft = trpc.drafts.create.useMutation()

  const getPayerParticipantId = async () => {
    const membership = await utils.preferences.getMembership.fetch({ groupId })
    return membership.participantId ?? undefined
  }

  const transcribeRecording = async (
    blob: Blob,
  ): Promise<TranscribeResponse> => {
    const formData = new FormData()
    formData.append('groupId', groupId)
    formData.append('audio', blob, 'recording.webm')

    const payerParticipantId = await getPayerParticipantId()
    if (payerParticipantId) {
      formData.append('payerParticipantId', payerParticipantId)
    }

    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData,
    })

    const data = (await response.json()) as TranscribeResponse
    if (data.transcript) {
      storedTranscriptRef.current = data.transcript
      setTranscript(data.transcript)
    }

    if (response.ok && data.draft && data.transcript) {
      return data
    }

    if (data.transcript) {
      return {
        transcript: data.transcript,
        stage: data.stage ?? 'parse',
        error: data.error,
      }
    }

    throw new Error(data.error ?? 'Could not transcribe audio')
  }

  const parseTranscript = async (
    transcriptText: string,
  ): Promise<ExpenseDraftPayload> => {
    const payerParticipantId = await getPayerParticipantId()
    const response = await fetch('/api/voice/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        transcript: transcriptText,
        payerParticipantId,
      }),
    })

    const data = (await response.json()) as TranscribeResponse
    if (!response.ok || !data.draft) {
      throw new Error(data.error ?? 'Could not parse voice expense')
    }

    return data.draft
  }

  const finishWithDraft = async (
    transcriptText: string,
    draft: ExpenseDraftPayload,
  ) => {
    setTranscript(transcriptText)
    storedTranscriptRef.current = transcriptText
    const created = await createDraft.mutateAsync({ groupId, payload: draft })
    setDraftId(created.draftId)
    setPayload(draft)
    setFailureMessage(null)
    setStatusMessage(null)
    setStep('review')
    toast({
      title: 'Voice captured',
      description: 'Review the draft expense below.',
    })
  }

  const processRecording = async (blob: Blob) => {
    if (!group) return

    storedBlobRef.current = blob
    setFailureMessage(null)
    setStatusMessage(null)
    setStep('processing')

    try {
      let transcriptText: string | null = null

      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt === 1) setStatusMessage('Retrying transcription…')
        try {
          const data = await transcribeRecording(blob)
          if (data.draft && data.transcript) {
            await finishWithDraft(data.transcript, data.draft)
            return
          }
          if (data.transcript) {
            transcriptText = data.transcript
            break
          }
          if (attempt === 1) {
            throw new Error(data.error ?? 'Could not transcribe audio')
          }
        } catch (transcribeError) {
          if (attempt === 1) throw transcribeError
        }
      }

      if (!transcriptText) {
        throw new Error('No transcript was captured.')
      }

      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt === 1) setStatusMessage('Retrying expense parsing…')
        try {
          const draft = await parseTranscript(transcriptText)
          await finishWithDraft(transcriptText, draft)
          return
        } catch (parseError) {
          if (attempt === 1) throw parseError
        }
      }
    } catch (err) {
      console.error(err)
      const message =
        err instanceof Error ? err.message : 'Could not process voice expense'
      setFailureMessage(message)
      setStep('failed')
      toast({
        title: 'Voice parsing failed',
        description: storedTranscriptRef.current
          ? 'We saved what you said — tap Try again to parse it once more.'
          : message,
        variant: 'destructive',
      })
    } finally {
      setStatusMessage(null)
    }
  }

  const retryFromStored = async () => {
    if (storedTranscriptRef.current) {
      setStep('processing')
      setFailureMessage(null)
      setStatusMessage('Retrying expense parsing…')
      try {
        const draft = await parseTranscript(storedTranscriptRef.current)
        await finishWithDraft(storedTranscriptRef.current, draft)
      } catch (err) {
        console.error(err)
        setFailureMessage(
          err instanceof Error ? err.message : 'Could not parse voice expense',
        )
        setStep('failed')
      } finally {
        setStatusMessage(null)
      }
      return
    }

    if (storedBlobRef.current) {
      await processRecording(storedBlobRef.current)
    }
  }

  const reset = () => {
    setStep('idle')
    setDraftId(null)
    setPayload(null)
    setFailureMessage(null)
    setStatusMessage(null)
    storedBlobRef.current = null
    storedTranscriptRef.current = null
  }

  const startRecording = async () => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to use voice expense entry.',
        variant: 'destructive',
      })
      return
    }

    setFailureMessage(null)
    setStatusMessage(null)
    storedBlobRef.current = null
    storedTranscriptRef.current = null

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

  if (step === 'review' && draftId && payload && group) {
    return (
      <ExpenseDraftReview
        groupId={groupId}
        group={group}
        draftId={draftId}
        initialPayload={payload}
        source="voice"
        onCancel={reset}
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
              : step === 'failed'
                ? 'bg-amber-100 dark:bg-amber-950'
                : 'bg-violet-100 dark:bg-violet-950'
          }`}
        >
          {step === 'processing' ? (
            <Loader2 className="w-8 h-8 animate-spin text-violet-700" />
          ) : step === 'recording' ? (
            <Square className="w-7 h-7 text-red-600" />
          ) : step === 'failed' ? (
            <AlertCircle className="w-8 h-8 text-amber-600" />
          ) : (
            <Mic className="w-8 h-8 text-violet-700" />
          )}
        </div>

        <div className="space-y-1">
          <p className="font-medium">
            {step === 'recording'
              ? 'Listening…'
              : step === 'processing'
                ? (statusMessage ?? 'Understanding your expense…')
                : step === 'failed'
                  ? 'Could not finish processing'
                  : 'Tap to describe your expense'}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {step === 'failed'
              ? failureMessage
              : 'Example: “I paid 45 dollars for dinner. Alice and I shared the pasta, Bob had the steak.”'}
          </p>
        </div>

        {step === 'recording' ? (
          <Button variant="destructive" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2" />
            Stop recording
          </Button>
        ) : step === 'processing' ? null : step === 'failed' ? (
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={retryFromStored}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" onClick={startRecording}>
              <Mic className="w-4 h-4 mr-2" />
              Record again
            </Button>
          </div>
        ) : (
          <Button onClick={startRecording} disabled={!group}>
            <Mic className="w-4 h-4 mr-2" />
            Start recording
          </Button>
        )}
      </div>

      {transcript && (step === 'idle' || step === 'failed') && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-left space-y-1">
          <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
            What we heard
          </p>
          <p className="text-muted-foreground">{transcript}</p>
        </div>
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
