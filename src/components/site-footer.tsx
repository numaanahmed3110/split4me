import { BrandMark } from '@/components/brand-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

/**
 * Landing footer modeled on Shadcnblocks footer-29 (multi-column, status
 * pulse, subscribe row). The registry item is pro-gated, so this is our
 * light-theme product version — no dark-mode toggle.
 */
export function SiteFooter({ tagline }: { tagline: string }) {
  return (
    <footer className="mt-8 hidden border-t bg-white md:block">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="size-8" />
            <span className="text-lg font-extrabold tracking-tight">
              split4me
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-6">{tagline}</p>
          <form
            className="flex max-w-sm overflow-hidden rounded-md border shadow-xs"
            onSubmit={(event) => event.preventDefault()}
          >
            <Input
              type="email"
              name="email"
              required
              placeholder="Email for product notes"
              className="h-10 rounded-none border-0 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="h-10 rounded-none px-4">
              Subscribe
            </Button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterCol
            title="Product"
            links={[
              ['Groups', '/groups'],
              ['Sign in', '/sign-in'],
            ]}
          />
          <FooterCol
            title="Workflow"
            links={[
              ['Add an expense', '/groups'],
              ['Settle up', '/groups'],
            ]}
          />
          <FooterCol title="Account" links={[['Settings', '/settings']]} />
          <FooterCol title="Legal" links={[['Home', '/']]} />
        </div>
      </div>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} split4me</p>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          All systems go
        </span>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
