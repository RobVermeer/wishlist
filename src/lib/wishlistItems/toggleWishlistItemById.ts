"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const toggleWishlistItemById = async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id

  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      id,
    },
    select: wishlistItemProperties,
  })

  if (!wishlistItem) {
    throw new Error("Wishlist item not found")
  }

  if (wishlistItem.boughtBy && wishlistItem.boughtBy.id !== userId) {
    throw new Error("Wishlist item already bought by someone else")
  }

  const boughtBy = wishlistItem.boughtBy
    ? { disconnect: { id: userId } }
    : { connect: { id: userId } }

  const data = await prisma.wishlistItem.update({
    where: { id },
    data: {
      boughtBy,
    },
    select: wishlistItemProperties,
  })

  revalidatePath("/")

  return data
}
