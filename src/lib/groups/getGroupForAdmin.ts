import "server-only"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/getSession"
import { cache } from "react"

export const getGroupForAdmin = cache(async (id: string) => {
  const session = await getSession()

  if (!session?.user.isAdmin) return null

  return prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      removed: true,
      members: {
        select: { id: true, name: true, email: true },
      },
    },
  })
})
