"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const getWishlistById = async (
  id: string,
  isOwnList: boolean = false
) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id
  const data = await prisma.wishlist.findUnique({
    select: wishlistProperties,
    where: { id },
  })

  if (!data) {
    throw new Error("Todo list not found")
  }

  if (isOwnList && data.user.id !== userId) {
    throw new Error("Access forbidden")
  }

  return { ...data, isOwnList: data.user.id === userId }
}
