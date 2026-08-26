import { PropsWithChildren, Suspense } from 'react'

export default function GroupsLayout({ children }: PropsWithChildren<{}>) {
  return (
    <Suspense>
      <main className="flex-1 w-full mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6 max-w-screen-md md:max-w-5xl">
        {children}
      </main>
    </Suspense>
  )
}
