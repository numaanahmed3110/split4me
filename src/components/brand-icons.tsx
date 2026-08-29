import { cn } from '@/lib/utils'

type IconProps = {
  className?: string
}

/** Four-slice mark used across the product chrome. */
export function BrandMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-6', className)} aria-hidden>
      <rect width="32" height="32" rx="10" fill="#F6F2E9" />
      <path d="M16 5a11 11 0 0 1 11 11h-11V5z" fill="#FDECAD" />
      <path d="M27 16a11 11 0 0 1-11 11V16h11z" fill="#D8CEFA" />
      <path d="M16 27A11 11 0 0 1 5 16h11v11z" fill="#E0F4F5" />
      <path d="M5 16A11 11 0 0 1 16 5v11H5z" fill="#1D1C22" />
      <circle cx="16" cy="16" r="2.2" fill="#fff" />
    </svg>
  )
}

export function IconHome({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-[22px]', className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 11.2 12 4.8l7.5 6.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.8v7.4c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-7.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect
        x="10.2"
        y="13.4"
        width="3.6"
        height="5.8"
        rx="0.8"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconSettle({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-[22px]', className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="8"
        cy="12"
        r="3.2"
        fill="#FDECAD"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="16"
        cy="12"
        r="3.2"
        fill="#E0F4F5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

export function IconActivity({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-[22px]', className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M4 14.5 8.2 9.2l3.4 4.2L16 7.5 20 12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="16"
        cy="7.5"
        r="1.4"
        fill="#D8CEFA"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </svg>
  )
}

export function IconAdd({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-6', className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-[22px]', className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.4 13.5a7.4 7.4 0 0 0 .1-3l1.7-1a.8.8 0 0 0 .2-.9l-1.6-2.8a.8.8 0 0 0-.8-.4l-2 .5a7.5 7.5 0 0 0-2.6-1.5l-.3-2a.8.8 0 0 0-.8-.7h-3.2a.8.8 0 0 0-.8.7l-.3 2a7.5 7.5 0 0 0-2.6 1.5l-2-.5a.8.8 0 0 0-.8.4L2.3 8.6a.8.8 0 0 0 .2.9l1.7 1a7.4 7.4 0 0 0 0 3l-1.7 1a.8.8 0 0 0-.2.9l1.6 2.8c.2.3.5.4.8.4l2-.5c.8.6 1.7 1.1 2.6 1.5l.3 2c.1.4.4.7.8.7h3.2c.4 0 .7-.3.8-.7l.3-2c1-.4 1.8-.9 2.6-1.5l2 .5c.3.1.7 0 .8-.4l1.6-2.8a.8.8 0 0 0-.2-.9l-1.7-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
