import { userProperties } from "@/lib/users/publicProperties"

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
