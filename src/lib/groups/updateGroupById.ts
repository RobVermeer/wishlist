"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const updateGroupById = async (id: string, formData: FormData) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id

  const group = await prisma.group.findUnique({
    where: {
      id,
      createdBy: { id: userId },
    },
  })

  if (!group) {
    throw new Error("Group not found")
  }

  const title = formData.get("name")?.toString()

  const data = await prisma.group.update({
    where: { id },
    data: {
      title,
    },
    select: groupProperties,
  })

  revalidatePath("/")

  return data
}
