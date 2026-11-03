import "server-only"

import { prisma } from "@/lib/prisma"
import { wishlistCardProperties } from "./publicProperties"
import { getSession } from "@/lib/getSession"
import { cache } from "react"
import { managedByUser } from "./visibility"

export const getFollowedWishlistsForUser = cache(async () => {
  const session = await getSession()

  if (!session) return []

  const wishlists = await prisma.wishlist.findMany({
    orderBy: { createdAt: "asc" },
    select: wishlistCardProperties,
    where: {
      removed: false,
      followers: { some: { id: session.user.id } },
      NOT: managedByUser(session.user.id),
    },
  })

  return wishlists.map(wishlist => ({ ...wishlist, isOwnList: false }))
})
