"use server"

import { randomBytes } from "crypto"
import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "./visibility"

export const getShareTokenForWishlist = async (id: string) => {
  try {
    const session = await getSession()
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

    // Only the first of two requests at once makes the link, so a link that
    // was already shared keeps working.
    await prisma.wishlist.updateMany({
      where: { id, shareToken: null },
      data: { shareToken: randomBytes(16).toString("base64url") },
    })
    const { shareToken } = await prisma.wishlist.findUniqueOrThrow({
      where: { id },
      select: { shareToken: true },
    })

    revalidatePath("/")

    return { type: "success" as const, shareToken: shareToken! }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
