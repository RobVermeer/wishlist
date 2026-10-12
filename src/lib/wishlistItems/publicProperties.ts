import { User, Wishlist, WishlistItem } from "@/generated/prisma/client"
import { userProperties } from "@/lib/users/publicProperties"

export interface WishlistItemProperties extends WishlistItem {
  wishlist: Wishlist
  boughtBy: User
}

export const wishlistItemProperties = {
  id: true,
  title: true,
  unlimited: true,
  url: true,
  boughtBy: {
    select: userProperties,
  },
  category: {
    select: { id: true, title: true },
  },
  wishlist: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  },
}
