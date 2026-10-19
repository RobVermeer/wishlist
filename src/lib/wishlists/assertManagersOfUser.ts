import "server-only"

import { prisma } from "@/lib/prisma"

export async function assertManagersOfUser(
  userId: string,
  managerIds: string[] = [],
  message: string
) {
  const uniqueIds = [...new Set(managerIds)]
  const count = await prisma.user.count({
    where: {
      id: { in: uniqueIds },
      NOT: { id: userId },
      subscribed: {
        some: { removed: false, members: { some: { id: userId } } },
      },
    },
  })

  if (count !== uniqueIds.length) {
    throw new Error(message)
  }
}
