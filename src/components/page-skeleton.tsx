import { Skeleton } from '@/components/ui/skeleton'

export function GroupCardsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-24 w-full rounded-3xl" />
      <div className="grid gap-2 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
    </div>
  )
}

export function GroupsListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <GroupCardsSkeleton />
    </div>
  )
}

export function GroupPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-10 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between gap-3 py-2">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export function FundPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full p-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}
