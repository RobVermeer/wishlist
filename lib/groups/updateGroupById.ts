import prisma from "~/lib/prisma"
import { groupProperties } from "./publicProperties"

export const updateGroupById = async (id, userData) => {
  const data = await prisma.group.update({
    where: { id },
    data: userData,
    select: groupProperties,
  })

  return data
}
