import "server-only"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/getSession"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getBoughtWishlistItemsForUser = cache(async () => {
  const session = await getSession()
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  const data = await prisma.wishlistItem.findMany({
    select: {
      id: true,
      title: true,
      removed: true,
      boughtAt: true,
      wishlist: {
        select: {
          title: true,
          removed: true,
          user: { select: { firstName: true, name: true } },
        },
      },
    },
    where: { userId },
    orderBy: [
      { boughtAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  })

  return data
})
