import { PropsWithChildren, Suspense } from 'react'

export default function GroupsLayout({ children }: PropsWithChildren<{}>) {
  return (
    <Suspense>
      <main className="flex-1 w-full mx-auto px-4 py-4 md:px-6 md:py-6 flex flex-col gap-6 max-w-lg">
        {children}
      </main>
    </Suspense>
  )
}
