"use server"

import { randomBytes } from "crypto"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "./visibility"

export const getShareTokenForWishlist = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id, removed: false, ...managedByUser(session.user.id) },
      select: { shareToken: true },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    if (wishlist.shareToken) {
      return { type: "success" as const, shareToken: wishlist.shareToken }
    }

    const { shareToken } = await prisma.wishlist.update({
      where: { id },
      data: { shareToken: randomBytes(16).toString("base64url") },
      select: { shareToken: true },
    })

    return { type: "success" as const, shareToken: shareToken! }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
