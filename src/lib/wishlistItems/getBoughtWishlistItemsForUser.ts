"use server"

import { User, Wishlist, WishlistItem } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "../wishlists/publicProperties"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface BoughtWishlistProperties extends Wishlist {
  user: User
}

export interface BoughtWishlistItemProperties extends WishlistItem {
  wishlist: BoughtWishlistProperties
}

export const getBoughtWishlistItemsForUser = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
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
}
