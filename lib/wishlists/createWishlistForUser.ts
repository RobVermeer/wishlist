import prisma from "~/lib/prisma"
import { wishlistProperties } from "./publicProperties"

export const createWishlistForUser = async (userId: string, userData: any) => {
  const data = await prisma.wishlist.create({
    select: wishlistProperties,
    data: {
      ...userData,
      createdAt: new Date(),
      userId,
    },
  })

  return data
}
