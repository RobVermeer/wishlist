"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const updateWishlistItemById = async (
  id: string,
  formData: FormData
) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id
  const title = formData.get("title")?.toString()
  const url = formData.get("url")?.toString()

  if (!title) {
    throw new Error("Title is mandatory")
  }

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

  const data = await prisma.wishlistItem.update({
    where: { id },
    data: {
      title,
      url,
    },
    select: wishlistItemProperties,
  })

  revalidatePath("/")

  return data
}
