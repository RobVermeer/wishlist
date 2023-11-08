"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export const deleteWishlistById = async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  const userId = session.user.id

  const wishlist = await prisma.wishlist.findUnique({
    where: {
      id,
      userId,
    },
  })

  if (!wishlist) {
    throw new Error("Wishlist not found")
  }

  const data = await prisma.wishlist.delete({
    where: { id },
  })

  revalidatePath("/")

  return data
}
