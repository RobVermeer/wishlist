import "server-only"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { getTranslations } from "next-intl/server"
import { visibleToUser } from "./visibility"
import { userProperties } from "@/lib/users/publicProperties"

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
        managers: {
          select: userProperties,
          orderBy: { firstName: "asc" },
        },
        followers: { where: { id: userId }, select: { id: true } },
      },
      where: { id, removed: false, ...visibleToUser(userId) },
    })

    if (!result) {
      throw new Error(t("wishlist.notFound"))
    }

    const { followers, managers, ...data } = result
    const isOwner = data.user.id === userId
    const isManager = managers.some(manager => manager.id === userId)
    const isOwnList = isOwner || isManager

    return {
      ...data,
      wishlistItem: data.wishlistItem.map(item => ({
        ...item,
        boughtByMe: item.boughtBy?.id === userId,
      })),
      isOwnList,
      isManager,
      managers: isOwner ? managers : [],
      managedWith: isOwnList
        ? [data.user, ...managers].filter(owner => owner.id !== userId)
        : [],
      isFollowing: followers.length > 0 && !isOwnList,
    }
  } catch {
    return null
  }
})
