import { Button } from '@/components/ui/button'
import { TrackPage } from '@/lib/analytics/track-page'
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

// FIX for https://github.com/vercel/next.js/issues/58615
// export const dynamic = 'force-dynamic'

export default function HomePage() {
  const t = useTranslations()
  return (
    <main>
      <TrackPage path="/" />
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container flex max-w-screen-md flex-col items-center gap-4 text-center">
          <h1 className="!leading-none font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl landing-header py-2">
            {t.rich('Homepage.title', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            {t.rich('Homepage.description', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <div className="flex gap-2">
            {/* Groups are behind auth, so the call to action opens the sign-in
                modal for a visitor rather than sending them to /groups just to
                be bounced back by the middleware. */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button>{t('Homepage.button.groups')}</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="secondary">Sign up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild>
                <Link href="/groups">{t('Homepage.button.groups')}</Link>
              </Button>
            </Show>
          </div>
        </div>
      </section>
    </main>
  )
}
