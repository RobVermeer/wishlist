"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "./visibility"

export const followWishlistByShareToken = async (shareToken: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: { shareToken, removed: false, NOT: managedByUser(userId) },
      select: { id: true },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { followers: { connect: { id: userId } } },
    })

    revalidatePath("/")

    return { type: "success" as const, wishlistId: wishlist.id }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
