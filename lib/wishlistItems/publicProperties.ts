import { userProperties } from "~/lib/users/publicProperties"

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
