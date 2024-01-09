"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const toggleWishlistItemById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        id,
        removed: false,
      },
      select: wishlistItemProperties,
    })

    if (!wishlistItem) {
      throw new Error(t("item.notFound"))
    }

    if (wishlistItem.boughtBy && wishlistItem.boughtBy.id !== userId) {
      throw new Error(t("item.alreadyBought"))
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
    trackIssue("Toggle wishlist item by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
