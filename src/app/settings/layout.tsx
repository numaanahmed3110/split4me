import { PropsWithChildren, Suspense } from 'react'

export default function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <main className="flex-1 w-full mx-auto px-4 py-4 md:px-8 md:py-8 flex flex-col gap-6 max-w-lg md:max-w-3xl">
        {children}
      </main>
    </Suspense>
  )
}
