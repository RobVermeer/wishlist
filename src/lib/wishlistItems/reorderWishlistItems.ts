"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const reorderWishlistItems = async (
  wishlistId: string,
  itemIds: string[]
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const items = await prisma.wishlistItem.findMany({
      where: {
        id: { in: itemIds },
        removed: false,
        wishlist: { id: wishlistId, userId: session.user.id, removed: false },
      },
      select: { id: true, position: true, categoryId: true },
    })

    if (
      items.length === 0 ||
      items.length !== new Set(itemIds).size ||
      items.length !== itemIds.length ||
      new Set(items.map(({ categoryId }) => categoryId)).size !== 1
    ) {
      throw new Error(t("item.notFound"))
    }

    const positions = items
      .map(({ position }) => position)
      .sort((a, b) => a - b)

    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.wishlistItem.update({
          where: { id, wishlistId },
          data: { position: positions[index] },
        })
      )
    )

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Reorder wishlist items", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
