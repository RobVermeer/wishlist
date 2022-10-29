import prisma from "~/lib/prisma"
import { wishlistProperties } from "./publicProperties"

export const getWishlistById = async (id: string) => {
  const data = await prisma.wishlist.findUnique({
    select: wishlistProperties,
    where: { id },
  })

  return data
}
