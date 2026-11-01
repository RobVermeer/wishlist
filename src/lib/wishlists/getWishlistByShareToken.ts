import "server-only"

import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { userProperties } from "@/lib/users/publicProperties"
import { interestProperties } from "@/lib/wishlistInterests/publicProperties"

export const getWishlistByShareToken = cache(async (shareToken: string) =>
  prisma.wishlist.findUnique({
    where: { shareToken, removed: false },
    select: {
      id: true,
      title: true,
      user: { select: userProperties },
      interests: {
        select: interestProperties,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    },
  })
)
