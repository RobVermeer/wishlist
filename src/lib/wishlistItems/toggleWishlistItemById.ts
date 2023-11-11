"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"

export const toggleWishlistItemById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        id,
      },
      select: wishlistItemProperties,
    })

    if (!wishlistItem) {
      throw new Error("Wens is niet gevonden")
    }

    if (wishlistItem.boughtBy && wishlistItem.boughtBy.id !== userId) {
      throw new Error("Deze wens is al door iemand anders gekocht")
    }

    const boughtBy = wishlistItem.boughtBy
      ? { disconnect: { id: userId } }
      : { connect: { id: userId } }

    await prisma.wishlistItem.update({
      where: { id },
      data: {
        boughtBy,
      },
      select: wishlistItemProperties,
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    console.error("Toggle wishlist item by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
