import "server-only"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"

export const getGroupForAdmin = cache(async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session?.user.isAdmin) return null

  return prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      members: {
        select: { id: true, name: true, email: true },
      },
    },
  })
})
