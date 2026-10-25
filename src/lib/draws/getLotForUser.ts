import "server-only"

import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"

// Who the current user drew in the active draw of a group they're in, with
// their own wishlist in that group. Never anyone else's lootje.
export const getLotForUser = cache(async (groupId: string) => {
  const session = await getServerSession(authOptions)

  if (!session) return null

  const userId = session.user.id
  const participant = await prisma.drawParticipant.findFirst({
    where: {
      userId,
      draw: {
        groupId,
        cancelledAt: null,
        group: { removed: false, members: { some: { id: userId } } },
      },
    },
    select: {
      receiver: { select: { name: true, userId: true } },
      draw: { select: { budget: true, date: true } },
    },
  })

  if (!participant?.receiver) return null

  const { receiver, draw } = participant
  const wishlist = receiver.userId
    ? await prisma.wishlist.findFirst({
        where: {
          userId: receiver.userId,
          title: null,
          removed: false,
          groups: { some: { id: groupId } },
        },
        select: { id: true },
      })
    : null

  return {
    receiver: receiver.name,
    wishlistId: wishlist?.id ?? null,
    budget: draw.budget,
    date: draw.date,
  }
})
