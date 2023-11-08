"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const leaveGroupById = async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id

  const group = await prisma.group.findUnique({
    where: {
      id,
    },
  })

  if (!group) {
    throw new Error("Group not found")
  }

  const data = await prisma.group.update({
    where: { id },
    data: {
      members: { disconnect: [{ id: userId }] },
    },
    select: groupProperties,
  })

  revalidatePath("/")

  return data
}
