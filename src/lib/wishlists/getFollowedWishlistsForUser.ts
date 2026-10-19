import "server-only"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"
import { managedByUser } from "./visibility"

export const getFollowedWishlistsForUser = cache(async () => {
  const session = await getServerSession(authOptions)

  if (!session) return []

  const wishlists = await prisma.wishlist.findMany({
    orderBy: { createdAt: "asc" },
    select: wishlistProperties,
    where: {
      removed: false,
      followers: { some: { id: session.user.id } },
      NOT: managedByUser(session.user.id),
    },
  })

  return wishlists.map(wishlist => ({ ...wishlist, isOwnList: false }))
})
