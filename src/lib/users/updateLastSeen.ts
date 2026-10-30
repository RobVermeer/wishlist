import "server-only"

import { prisma } from "@/lib/prisma"

const day = 24 * 60 * 60 * 1000

// Called for every request with a session, so it only writes once a day.
export const updateLastSeen = async (user: {
  id: string
  lastSeenAt?: Date | null
}) => {
  if (user.lastSeenAt && Date.now() - user.lastSeenAt.getTime() < day) return

  try {
    await prisma.user.update({
      data: { lastSeenAt: new Date() },
      where: { id: user.id },
    })
  } catch (error) {
    console.error(error)
  }
}
