"use server"

import { randomBytes } from "crypto"
import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "./visibility"

export const resetShareTokenForWishlist = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id, removed: false, ...managedByUser(session.user.id) },
      select: { id: true },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
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
