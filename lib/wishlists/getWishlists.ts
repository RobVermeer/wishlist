import prisma from "~/lib/prisma"
import { wishlistProperties } from "./publicProperties"

export const getWishlists = async () => {
  const data = await prisma.wishlist.findMany({
    orderBy: { createdAt: "desc" },
    select: wishlistProperties,
  })

  return data
}