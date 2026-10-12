import "server-only"

import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { userProperties } from "@/lib/users/publicProperties"

export const getWishlistByShareToken = cache(async (shareToken: string) =>
  prisma.wishlist.findUnique({
    where: { shareToken, removed: false },
    select: {
      id: true,
      title: true,
      description: true,
      user: { select: userProperties },
    },
  })
)
