import prisma from "~/lib/prisma"
import { groupProperties } from "./publicProperties"

export const getGroupById = async (id) => {
  const data = await prisma.group.findUnique({
    select: groupProperties,
    where: { id },
  })

  return data
}