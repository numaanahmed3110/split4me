import type { ToastActionElement } from '@/components/ui/toast'
import { toast } from '@/components/ui/use-toast'

type ToastHandle = ReturnType<typeof toast>

export function toastSuccess(title: string, description?: string) {
  return toast({ title, description })
}

export function toastError(
  title: string,
  description?: string,
  action?: ToastActionElement,
) {
  return toast({
    title,
    description,
    variant: 'destructive',
    action,
  })
}

/** Shows a persistent toast while an operation is retrying. Call dismiss() when done. */
export function toastRetrying(description: string): ToastHandle {
  return toast({
    title: 'Retrying…',
    description,
  })
}

export function dismissToast(handle: ToastHandle | null | undefined) {
  handle?.dismiss()
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
