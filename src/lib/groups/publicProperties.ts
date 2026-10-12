import { userProperties } from "@/lib/users/publicProperties"
import { wishlistProperties } from "@/lib/wishlists/publicProperties"

export const groupProperties = {
  id: true,
  title: true,
  createdBy: {
    select: userProperties,
  },
  wishlist: {
    select: wishlistProperties,
    where: { removed: false },
  },
  members: {
    select: userProperties,
  },
  theme: true,
}
