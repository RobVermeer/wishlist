import "server-only"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getBoughtWishlistItemsForUser = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const items = await prisma.wishlistItem.findMany({
    orderBy: [{ wishlist: { createdAt: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      url: true,
      wishlist: {
        select: {
          id: true,
          title: true,
          user: { select: { firstName: true, name: true } },
        },
      },
    },
    where: {
      userId: session.user.id,
      removed: false,
      wishlist: { removed: false },
    },
  })

  const wishlists = new Map<
    string,
    { wishlist: (typeof items)[number]["wishlist"]; items: typeof items }
  >()

  for (const item of items) {
    const entry = wishlists.get(item.wishlist.id) ?? {
      wishlist: item.wishlist,
      items: [],
    }
    entry.items.push(item)
    wishlists.set(item.wishlist.id, entry)
  }

  return [...wishlists.values()]
})
