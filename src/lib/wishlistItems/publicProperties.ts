import { userProperties } from "@/lib/users/publicProperties"

export const wishlistItemProperties = {
  id: true,
  title: true,
  unlimited: true,
  links: {
    select: { url: true },
    orderBy: { position: "asc" as const },
  },
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
