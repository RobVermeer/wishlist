import prisma from "~/lib/prisma"
import { wishlistProperties } from "./publicProperties"

export const updateWishlistById = async (id, userData) => {
  const data = await prisma.wishlist.update({
    where: { id },
    data: userData,
    select: wishlistProperties,
  })

  return data
}
