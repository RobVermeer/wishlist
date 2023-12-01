import { Group, User, Wishlist, WishlistItem } from "@prisma/client"
import { userProperties } from "@/lib/users/publicProperties"
import { wishlistItemProperties } from "@/lib/wishlistItems/publicProperties"

export interface WishlistProperties extends Wishlist {
  user: User
  groups: Group[]
  wishlistItem: WishlistItem[]
}

export const wishlistProperties = {
  id: true,
  title: true,
  theme: true,
  user: {
    select: userProperties,
  },
  groups: {
    select: { id: true, title: true },
  },
  wishlistItem: {
    select: wishlistItemProperties,
  },
}
