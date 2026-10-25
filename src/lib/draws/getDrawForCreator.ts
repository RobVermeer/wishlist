import "server-only"

import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"

const day = 24 * 60 * 60 * 1000

// The active draw of a group for its creator: who takes part and whether
// they're in the group, but never who drew whom or their e-mail addresses.
export const getDrawForCreator = cache(async (groupId: string) => {
  const session = await getServerSession(authOptions)

  if (!session) return null

  const draw = await prisma.draw.findFirst({
    where: {
      groupId,
      cancelledAt: null,
      group: { removed: false, userId: session.user.id },
    },
    select: {
      group: { select: { members: { select: { id: true } } } },
      participants: {
        select: { id: true, name: true, userId: true, lastSentAt: true },
        orderBy: { name: "asc" },
      },
    },
  })

  if (!draw) return null

  const memberIds = draw.group.members.map(({ id }) => id)
  const now = Date.now()

  return draw.participants.map(({ id, name, userId, lastSentAt }) => {
    const status = !userId
      ? ("invited" as const)
      : memberIds.includes(userId)
        ? ("member" as const)
        : ("left" as const)

    return {
      id,
      name,
      status,
      canResend:
        status === "invited" &&
        (!lastSentAt || now - lastSentAt.getTime() >= day),
    }
  })
})
