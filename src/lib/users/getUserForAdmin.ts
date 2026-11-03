import "server-only"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/getSession"
import { cache } from "react"

// Leaves out who bought a wish, so the surprise stays safe for admins too.
export const getUserForAdmin = cache(async (id: string) => {
  const session = await getSession()

  if (!session?.user.isAdmin) return null

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      firstName: true,
      wishlists: {
        where: { removed: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          wishlistItem: {
            where: { removed: false },
            orderBy: { position: "asc" },
            select: { id: true, title: true, userId: true },
          },
        },
      },
    },
  })

  if (!user) return null

  return {
    ...user,
    wishlists: user.wishlists.map(({ wishlistItem, ...wishlist }) => ({
      ...wishlist,
      items: wishlistItem.map(({ id, title, userId }) => ({
        id,
        title,
        bought: userId !== null,
      })),
    })),
  }
})
