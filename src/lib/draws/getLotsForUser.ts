import "server-only"

import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"

// The current user's lootjes in the active draws of all groups they're in,
// the ones with a date first.
export const getLotsForUser = cache(async () => {
  const session = await getServerSession(authOptions)

  if (!session) return []

  const userId = session.user.id
  const participants = await prisma.drawParticipant.findMany({
    where: {
      userId,
      receiverId: { not: null },
      draw: {
        cancelledAt: null,
        group: { removed: false, members: { some: { id: userId } } },
      },
    },
    select: {
      receiver: { select: { name: true } },
      draw: {
        select: {
          budget: true,
          date: true,
          group: { select: { id: true, title: true } },
        },
      },
    },
  })

  return participants
    .map(({ receiver, draw }) => ({
      receiver: receiver!.name,
      budget: draw.budget,
      date: draw.date,
      group: draw.group,
    }))
    .sort(
      (a, b) =>
        (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity) ||
        a.group.title.localeCompare(b.group.title, "nl")
    )
})
