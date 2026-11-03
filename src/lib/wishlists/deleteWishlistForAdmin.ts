"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

// For verlanglijstjes that break the huisregels.
export const deleteWishlistForAdmin = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (!session.user.isAdmin) {
      throw new Error(t("noAccess"))
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id, removed: false },
      select: { id: true },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    await prisma.wishlist.update({
      data: { removed: true },
      where: { id },
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
