import prisma from "~/lib/prisma"
import { wishlistProperties } from "./publicProperties"

export const getWishlistsForUser = async (userId: string) => {
  const data = await prisma.wishlist.findMany({
    orderBy: { createdAt: "asc" },
    select: wishlistProperties,
    where: { userId },
  })

  return data
}
