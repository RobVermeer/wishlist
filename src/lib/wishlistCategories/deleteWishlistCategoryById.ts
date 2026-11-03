"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/getSession"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "@/lib/wishlists/visibility"
import { nextWishlistItemPosition } from "@/lib/wishlistItems/nextWishlistItemPosition"

export const deleteWishlistCategoryById = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const category = await prisma.wishlistCategory.findUnique({
      where: {
        id,
        wishlist: { removed: false, ...managedByUser(session.user.id) },
      },
      include: {
        wishlistItem: {
          where: { removed: false },
          orderBy: { position: "asc" },
          select: { id: true },
        },
      },
    })

    if (!category) {
      throw new Error(t("category.notFound"))
    }

    // The wishes stay, in the same order, below the wishes that already had
    // no category.
    await prisma.$transaction(async tx => {
      const first = await nextWishlistItemPosition(tx, category.wishlistId)

      for (const [index, item] of category.wishlistItem.entries()) {
        await tx.wishlistItem.update({
          where: { id: item.id },
          data: { categoryId: null, position: first + index },
        })
      }

      await tx.wishlistCategory.delete({ where: { id } })
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
