import prisma from "~/lib/prisma"
import { groupProperties } from "./publicProperties"

export const createGroupForUser = async (userId, userData) => {
  const data = await prisma.group.create({
    select: groupProperties,
    data: {
      ...userData,
      createdAt: new Date(),
      userId,
    },
  })

  return data
}
