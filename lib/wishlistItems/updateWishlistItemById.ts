import prisma from "~/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"

export const updateWishlistItemById = async (id, userData) => {
  const data = await prisma.wishlistItem.update({
    where: { id },
    data: userData,
    select: wishlistItemProperties,
  })

  return data
}
