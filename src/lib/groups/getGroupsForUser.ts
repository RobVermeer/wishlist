"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const getGroupsForUser = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id

  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    select: groupProperties,
    where: {
      members: {
        some: { id: userId },
      },
    },
  })

  return groups.map((group) => ({
    ...group,
    isOwnGroup: group.createdBy.id === userId,
  }))
}
