import { prisma } from '@/lib/prisma'

export async function upsertUserFromClerk(clerkUser: {
  id: string
  emailAddresses: { emailAddress: string }[]
  firstName: string | null
  lastName: string | null
}) {
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    email ||
    'User'

  return prisma.user.upsert({
    where: { id: clerkUser.id },
    create: { id: clerkUser.id, email, name },
    update: { email, name },
  })
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { id: clerkId } })
}
