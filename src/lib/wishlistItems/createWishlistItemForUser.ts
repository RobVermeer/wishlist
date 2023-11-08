"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const createWishlistItemForUser = async (
  wishlistId: string,
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

  const wishlist = await prisma.wishlist.findUnique({
    where: {
      id: wishlistId,
      userId,
    },
  })

  if (!wishlist) {
    throw new Error("Wishlist not found")
  }

  const data = await prisma.wishlistItem.create({
    select: wishlistItemProperties,
    data: {
      title,
      url,
      createdAt: new Date(),
      wishlistId,
    },
  })

  revalidatePath("/")

  return data
}
