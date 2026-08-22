import { cn } from '@/lib/utils'

export function Progress({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div
      className={cn('w-full bg-muted rounded-full overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
