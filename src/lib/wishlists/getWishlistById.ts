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
    const result = await prisma.wishlist.findUnique({
      select: {
        ...wishlistProperties,
        followers: { where: { id: userId }, select: { id: true } },
      },
      where: { id, removed: false, ...visibleToUser(userId) },
    })

    if (!result) {
      throw new Error(t("wishlist.notFound"))
    }

    const { followers, ...data } = result

    return {
      ...data,
      isOwnList: data.user.id === userId,
      isFollowing: followers.length > 0,
    }
  } catch {
    return null
  }
})
