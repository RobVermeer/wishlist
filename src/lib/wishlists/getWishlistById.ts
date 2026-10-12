import "server-only"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { getTranslations } from "next-intl/server"
import { visibleToUser } from "./visibility"

export const getWishlistById = cache(async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id
    const data = await prisma.wishlist.findUnique({
      select: wishlistProperties,
      where: { id, removed: false, ...visibleToUser(userId) },
    })

    if (!data) {
      throw new Error(t("wishlist.notFound"))
    }

    return { ...data, isOwnList: data.user.id === userId }
  } catch {
    return null
  }
})
