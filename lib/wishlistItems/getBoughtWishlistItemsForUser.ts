import { User, Wishlist, WishlistItem } from "@prisma/client"
import prisma from "~/lib/prisma"
import { wishlistProperties } from "../wishlists/publicProperties"
import { wishlistItemProperties } from "./publicProperties"

interface BoughtWishlistProperties extends Wishlist {
  user: User
}

export interface BoughtWishlistItemProperties extends WishlistItem {
  wishlist: BoughtWishlistProperties
}

export const getBoughtWishlistItemsForUser = async (userId: string) => {
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
