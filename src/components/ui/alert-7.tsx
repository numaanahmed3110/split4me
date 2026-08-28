"use client"

import { useEffect, useState } from "react"
import { MdOutlineFileUpload } from "react-icons/md"
import { RxCross2 } from "react-icons/rx"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function Alert7({
  fileName = "receipt.png",
  progress,
  onCancel,
  onClose,
}: {
  fileName?: string
  progress?: number
  onCancel?: () => void
  onClose?: () => void
}) {
  const [isActive, setIsActive] = useState(true)
  const [internalProgress, setInternalProgress] = useState(0)
  const value = progress ?? internalProgress

  useEffect(() => {
    if (progress !== undefined) return
    const timer = setTimeout(() => setInternalProgress(50), 100)
    return () => clearTimeout(timer)
  }, [progress])

  if (!isActive) return null

  return (
    <Alert className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex w-full items-start gap-3">
        <MdOutlineFileUpload className="size-5 shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <AlertTitle>Uploading your &apos;{fileName}&apos;</AlertTitle>
            <AlertDescription>
              Please wait while we upload your image.
            </AlertDescription>
          </div>

          <Progress
            value={value}
            className="h-1.5 bg-cyan-600/20 [&>[data-slot=progress-indicator]]:bg-cyan-600"
            aria-label="Upload Progress"
          />

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              className="h-7 rounded-md px-2"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled
              className="h-7 rounded-md px-2 text-cyan-600 hover:bg-cyan-600/10 hover:text-cyan-600"
            >
              Upload another
            </Button>
          </div>
        </div>

        <button
          type="button"
          className="size-4 shrink-0 cursor-pointer"
          onClick={() => {
            setIsActive(false)
            onClose?.()
          }}
        >
          <RxCross2 className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </Alert>
  )
}

export default Alert7
