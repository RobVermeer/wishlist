"use server"

import { User, Wishlist, WishlistItem } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "@/lib/wishlists/publicProperties"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

interface BoughtWishlistProperties extends Wishlist {
  user: User
}

export interface BoughtWishlistItemProperties extends WishlistItem {
  wishlist: BoughtWishlistProperties
}

export const getBoughtWishlistItemsForUser = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  const data = await prisma.wishlistItem.findMany({
    select: {
      ...wishlistItemProperties,
      wishlist: {
        select: wishlistProperties,
      },
    },
    where: { userId },
  })

  return data
})
