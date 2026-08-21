import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-4">
      <SignIn />
    </main>
  )
}
