import prisma from "~/lib/prisma"
import { groupProperties } from "./publicProperties"

export const getGroups = async () => {
  const data = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    select: groupProperties,
  })

  return data
}
