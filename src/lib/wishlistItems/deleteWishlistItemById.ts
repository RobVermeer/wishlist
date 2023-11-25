"use server"

import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"

export const deleteWishlistItemById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const wishlistItemToDelete = await prisma.wishlistItem.findUnique({
      where: {
        id,
        wishlist: {
          userId,
        },
      },
    })

    if (!wishlistItemToDelete) {
      throw new Error("Wens is niet gevonden")
    }

    await prisma.wishlistItem.delete({
      where: { id },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    console.error("Delete wishlist item by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
