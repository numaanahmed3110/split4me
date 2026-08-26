'use client'

import { BrandMark } from '@/components/brand-icons'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const KEY = 'split4me-pwa-onboarded'
const STEPS = [
  { titleKey: 'pwa1Title' as const, bodyKey: 'pwa1Body' as const },
  { titleKey: 'pwa2Title' as const, bodyKey: 'pwa2Body' as const },
  { titleKey: 'pwa3Title' as const, bodyKey: 'pwa3Body' as const },
]

export function PwaOnboarding() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('Onboarding')
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (window.localStorage.getItem(KEY) === '1') return
    setReady(true)
  }, [])

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
    <div className="fixed inset-0 z-[80] bg-[#F6F2E9] flex flex-col md:hidden overflow-y-auto">
      <button
        type="button"
        className="absolute top-4 left-5 z-10 text-sm font-semibold text-[#1D1C22]"
        onClick={finish}
      >
        {t('pwaSkip')}
      </button>
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-14 min-h-[240px]">
        <StackedBills step={step} />
      </div>
      <div className="px-6 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">
        <h2 className="text-[28px] font-extrabold tracking-tight leading-[1.15] text-center">
          {t(current.titleKey)}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-6 text-center max-w-xs mx-auto">
          {t(current.bodyKey)}
        </p>
        <div className="flex justify-center gap-2 mt-6 mb-7">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === step ? 'bg-[#1D1C22]' : 'bg-[#D9D3C8]'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className="text-sm font-semibold text-[#1D1C22] px-2 py-3 min-w-[64px]"
            onClick={finish}
          >
            {t('pwaSkip')}
          </button>
          <Button
            className="h-14 flex-1 max-w-[220px] rounded-full bg-[#D8CEFA] text-[#1D1C22] text-base font-semibold hover:bg-[#D8CEFA]/90 shadow-[0_12px_30px_rgba(216,206,250,0.55)]"
            onClick={() => (last ? finish() : setStep((s) => s + 1))}
          >
            {last ? t('pwaCta') : t('pwaNext')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StackedBills({ step }: { step: number }) {
  const offset = step * 8
  return (
    <div className="relative w-full max-w-[260px] h-[230px]">
      <div
        className="absolute left-8 right-2 top-4 h-[210px] rounded-[28px] bg-[#E0F4F5] shadow-sm"
        style={{ transform: `rotate(${6 + offset / 8}deg)` }}
      />
      <div
        className="absolute left-4 right-6 top-10 h-[210px] rounded-[28px] bg-[#FDECAD] shadow-sm"
        style={{ transform: `rotate(${-5 - offset / 10}deg)` }}
      />
      <div className="absolute inset-x-6 top-16 rounded-[28px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrandMark className="size-8" />
          <span className="font-extrabold tracking-tight">split4me</span>
        </div>
        <p className="text-xs text-muted-foreground">Dinner with friends</p>
        <p className="text-2xl font-extrabold tracking-tight mt-1">$42.00</p>
        <div className="flex -space-x-2 mt-4">
          <span className="size-8 rounded-full bg-[#E8E2FC] border-2 border-white" />
          <span className="size-8 rounded-full bg-[#E0F4F5] border-2 border-white" />
          <span className="size-8 rounded-full bg-[#FDECAD] border-2 border-white" />
        </div>
        <div className="mt-4 h-10 rounded-full bg-[#1D1C22] text-white text-sm font-semibold flex items-center justify-center">
          Split now
        </div>
      </div>
    </div>
  )
}
