"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const createWishlistForUser = async (formData: FormData) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id
  const title = formData.get("name")?.toString()
  const groups =
    formData.getAll("groups").map((group) => group.toString()) || []

  if (!title) {
    throw new Error("Title is mandatory")
  }

  const data = await prisma.wishlist.create({
    select: wishlistProperties,
    data: {
      title,
      groups: { connect: groups.map((id) => ({ id })) },
      createdAt: new Date(),
      userId,
    },
  })

  revalidatePath("/")

  return data
}
