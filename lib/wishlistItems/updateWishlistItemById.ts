import prisma from "~/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"

export const updateWishlistItemById = async (id: string, userData: any) => {
  const data = await prisma.wishlistItem.update({
    where: { id },
    data: userData,
    select: wishlistItemProperties,
  })

  return data
}
