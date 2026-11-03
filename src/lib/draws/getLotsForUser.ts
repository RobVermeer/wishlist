import "server-only"

import { cache } from "react"
import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { notOver } from "./notOver"

// The groups where the current user has a lootje in an active draw, the ones
// with a date first. Who they drew only shows in the group.
export const getLotsForUser = cache(async () => {
  const session = await getSession()

  if (!session) return []

  const userId = session.user.id
  const participants = await prisma.drawParticipant.findMany({
    where: {
      userId,
      receiverId: { not: null },
      draw: {
        cancelledAt: null,
        ...notOver(),
        group: { removed: false, members: { some: { id: userId } } },
      },
    },
    select: {
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
    .map(({ draw }) => ({
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
