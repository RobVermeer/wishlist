"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { groupProperties } from "./publicProperties"

export const deleteGroupById = async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const group = await prisma.group.findUnique({
    select: groupProperties,
    where: { id },
  })

  const userId = session.user.id

  if (group?.createdBy.id !== userId && !session.user.isAdmin) {
    throw new Error("Access forbidden")
  }

  const data = await prisma.group.delete({
    where: { id },
  })

  revalidatePath("/")

  return data
}
