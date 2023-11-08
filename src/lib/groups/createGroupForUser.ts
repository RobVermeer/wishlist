"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const createGroupForUser = async (formData: FormData) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id
  const title = formData.get("title")?.toString()

  if (!title) {
    throw new Error("Title is mandatory")
  }

  const data = await prisma.group.create({
    select: groupProperties,
    data: {
      title,
      members: { connect: [{ id: userId }] },
      createdAt: new Date(),
      userId,
    },
  })

  revalidatePath("/")

  return data
}
