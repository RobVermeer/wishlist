"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const followWishlistByShareToken = async (shareToken: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: { shareToken, removed: false, userId: { not: userId } },
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
    trackIssue("Follow wishlist by share token", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
