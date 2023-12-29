"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

export const deleteWishlistItemById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlistItemToDelete = await prisma.wishlistItem.findUnique({
      where: {
        id,
        wishlist: {
          userId,
        },
        removed: false,
      },
    })

    if (!wishlistItemToDelete) {
      throw new Error(t("item.notFound"))
    }

    await prisma.wishlistItem.update({
      data: { removed: true },
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
