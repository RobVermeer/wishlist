import prisma from "~/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"

export const createWishlistItemForUser = async (wishlistId, userData) => {
  const data = await prisma.wishlistItem.create({
    select: wishlistItemProperties,
    data: {
      ...userData,
      createdAt: new Date(),
      wishlistId,
    },
  })

  return data
}
