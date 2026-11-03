import "server-only"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getSession } from "@/lib/getSession"
import { cache } from "react"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "./visibility"

export const getWishlistsForUser = cache(async () => {
  const session = await getSession()
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  const data = await prisma.wishlist.findMany({
    orderBy: { createdAt: "asc" },
    select: wishlistProperties,
    where: { removed: false, ...managedByUser(userId) },
  })

  const wishlists = data.map(wishlist => ({
    ...wishlist,
    isOwnList: true,
  }))

  return wishlists
})
