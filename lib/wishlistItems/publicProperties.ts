import { User, Wishlist, WishlistItem } from "@prisma/client"
import { userProperties } from "~/lib/users/publicProperties"

export interface WishlistItemProperties extends WishlistItem {
  wishlist: Wishlist
  boughtBy: User
}

export const wishlistItemProperties = {
  id: true,
  title: true,
  url: true,
  boughtBy: {
    select: userProperties,
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
