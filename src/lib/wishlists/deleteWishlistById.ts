"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"

export const deleteWishlistById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!wishlist) {
      throw new Error("Verlanglijst is niet gevonden")
    }

    await prisma.wishlist.delete({
      where: { id },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
