import prisma from "~/lib/prisma"
import { groupProperties } from "./publicProperties"

export const getGroupsForUser = async (userId) => {
  const data = await prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    select: groupProperties,
    where: {
      members: {
        some: { id: userId },
      },
    },
  })

  return data
}
