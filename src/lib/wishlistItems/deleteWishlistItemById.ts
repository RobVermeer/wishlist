"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { removeEmptyCategories } from "@/lib/wishlistCategories"
import { managedByUser } from "@/lib/wishlists/visibility"

export const deleteWishlistItemById = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlistItemToDelete = await prisma.wishlistItem.findUnique({
      where: {
        id,
        wishlist: { removed: false, ...managedByUser(userId) },
        removed: false,
      },
    })

    if (!wishlistItemToDelete) {
      throw new Error(t("item.notFound"))
    }

    await prisma.$transaction(async tx => {
      await tx.wishlistItem.update({
        data: { removed: true },
        where: { id },
      })

      await removeEmptyCategories(tx, wishlistItemToDelete.wishlistId)
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
