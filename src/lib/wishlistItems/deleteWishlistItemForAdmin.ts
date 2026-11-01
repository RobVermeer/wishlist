"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { removeEmptyCategories } from "@/lib/wishlistCategories"

// Lets admins clean up bought wishes on a verlanglijstje whose owner doesn't,
// and remove wishes that break the huisregels. The buyer keeps the gift on
// their bought presents page.
export const deleteWishlistItemForAdmin = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (!session.user.isAdmin) {
      throw new Error(t("noAccess"))
    }

    const wishlistItemToDelete = await prisma.wishlistItem.findUnique({
      where: {
        id,
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
