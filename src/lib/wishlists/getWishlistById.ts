import "server-only"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getSession } from "@/lib/getSession"
import { getTranslations } from "next-intl/server"
import { visibleToUser } from "./visibility"
import { userProperties } from "@/lib/users/publicProperties"
import { interestProperties } from "@/lib/wishlistInterests/publicProperties"
import { removeBoughtItemsAfterParty } from "@/lib/wishlistItems/removeBoughtItemsAfterParty"

export const getWishlistById = cache(async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    await removeBoughtItemsAfterParty()

    const userId = session.user.id
    const result = await prisma.wishlist.findUnique({
      select: {
        ...wishlistProperties,
        managers: {
          select: userProperties,
          orderBy: { firstName: "asc" },
        },
        followers: { where: { id: userId }, select: { id: true } },
        interests: {
          select: interestProperties,
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
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
      hasManagers: managers.length > 0,
      managedWith: isOwnList
        ? [data.user, ...managers].filter(owner => owner.id !== userId)
        : [],
      isFollowing: followers.length > 0 && !isOwnList,
    }
  } catch {
    return null
  }
})
