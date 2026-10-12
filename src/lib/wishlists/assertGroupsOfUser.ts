import "server-only"

import { prisma } from "@/lib/prisma"

export async function assertGroupsOfUser(
  userId: string,
  groupIds: string[] = [],
  message: string
) {
  const uniqueIds = [...new Set(groupIds)]
  const count = await prisma.group.count({
    where: {
      id: { in: uniqueIds },
      removed: false,
      members: { some: { id: userId } },
    },
  })

  if (count !== uniqueIds.length) {
    throw new Error(message)
  }
}
