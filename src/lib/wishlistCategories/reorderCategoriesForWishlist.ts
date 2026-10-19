"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"
import { managedByUser } from "@/lib/wishlists/visibility"

export const reorderCategoriesForWishlist = async (
  wishlistId: string,
  categoryIds: string[]
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
        removed: false,
        ...managedByUser(session.user.id),
      },
      include: { categories: { select: { id: true } } },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const currentIds = wishlist.categories.map(({ id }) => id).sort()

    if (
      currentIds.length !== categoryIds.length ||
      [...categoryIds].sort().some((id, index) => id !== currentIds[index])
    ) {
      throw new Error(t("category.notFound"))
    }

    await prisma.$transaction(
      categoryIds.map((id, position) =>
        prisma.wishlistCategory.update({
          where: { id, wishlistId },
          data: { position },
        })
      )
    )

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Reorder categories for wishlist", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
