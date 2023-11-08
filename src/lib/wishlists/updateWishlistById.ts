"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export const updateWishlistById = async (id: string, formData: FormData) => {
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

  const title = formData.get("name")?.toString()
  const groups =
    formData.getAll("groups").map((group) => group.toString()) || []

  const data = await prisma.wishlist.update({
    where: { id },
    data: {
      title,
      groups: { set: groups.map((id) => ({ id })) },
    },
    select: wishlistProperties,
  })

  revalidatePath("/")

  return data
}
