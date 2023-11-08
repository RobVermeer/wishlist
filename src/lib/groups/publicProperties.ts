import { Group, User, Wishlist } from "@prisma/client"
import { userProperties } from "@/lib/users/publicProperties"
import { wishlistProperties } from "@/lib/wishlists/publicProperties"

export interface GroupProperties extends Group {
  wishlist: Wishlist
  members: User[]
  createdBy: User
}

export const groupProperties = {
  id: true,
  title: true,
  createdBy: {
    select: userProperties,
  },
  wishlist: {
    select: wishlistProperties,
  },
  members: true,
}
