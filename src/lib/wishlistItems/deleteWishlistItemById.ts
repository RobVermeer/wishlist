"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export const deleteWishlistItemById = async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id

  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      id,
      wishlist: {
        userId,
      },
    },
  })

  if (!wishlistItem) {
    throw new Error("Wishlist item not found")
  }

  const data = await prisma.wishlistItem.delete({
    where: { id },
  })

  revalidatePath("/")

  return data
}
