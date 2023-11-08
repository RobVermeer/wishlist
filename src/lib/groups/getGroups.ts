import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const getGroups = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  if (!session.user.isAdmin) {
    throw new Error("Access forbidden")
  }

  const data = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    select: groupProperties,
  })

  return data
}
