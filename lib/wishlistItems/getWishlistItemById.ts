import prisma from "~/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"

export const getWishlistItemById = async (id) => {
  const data = await prisma.wishlistItem.findUnique({
    select: wishlistItemProperties,
    where: { id },
  })

  return data
}
