'use client'

import { Button } from '@/components/ui/button'
import { useIsInstalledPwa } from '@/lib/hooks'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const KEY = 'split4me-pwa-onboarded'
const STEPS = [
  {
    image: '/onboarding/onboard-voice.png',
    titleKey: 'pwa1Title' as const,
    bodyKey: 'pwa1Body' as const,
  },
  {
    image: '/onboarding/onboard-ledger.png',
    titleKey: 'pwa2Title' as const,
    bodyKey: 'pwa2Body' as const,
  },
  {
    image: '/onboarding/onboard-split.png',
    titleKey: 'pwa3Title' as const,
    bodyKey: 'pwa3Body' as const,
  },
]

export function PwaOnboarding() {
  const installed = useIsInstalledPwa()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('Onboarding')
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!installed) return
    if (window.localStorage.getItem(KEY) === '1') return
    setReady(true)
  }, [installed])

  if (!ready) return null
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return null
  }

  const current = STEPS[step]
  const last = step === STEPS.length - 1

  const finish = () => {
    window.localStorage.setItem(KEY, '1')
    setReady(false)
    router.push('/groups')
  }

  return (
    <div className="fixed inset-0 z-[80] bg-[#F6F2E9] flex flex-col md:hidden">
      <button
        type="button"
        className="absolute top-4 right-5 text-sm font-medium text-muted-foreground z-10"
        onClick={finish}
      >
        {t('skip')}
      </button>
      <div className="flex-1 relative">
        <Image
          src={current.image}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div className="px-6 pt-6 pb-[max(28px,env(safe-area-inset-bottom))] bg-white rounded-t-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.06)]">
        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i === step ? 'bg-[#1D1C22]' : 'bg-[#EBEBEB]'
              }`}
            />
          ))}
        </div>
        <h2 className="text-[26px] font-bold tracking-tight leading-tight">
          {t(current.titleKey)}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-6">
          {t(current.bodyKey)}
        </p>
        <Button
          className="w-full h-12 mt-6"
          onClick={() => (last ? finish() : setStep((s) => s + 1))}
        >
          {last ? t('cta') : t('next')}
        </Button>
      </div>
    </div>
  )
}
