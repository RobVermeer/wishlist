import prisma from "./prisma"
import { publicUserProperties } from "./users"
import { publicWishlistProperties } from "./wishlists"

export const publicGroupProperties = {
  id: true,
  title: true,
  createdBy: {
    select: publicUserProperties,
  },
  wishlist: {
    select: publicWishlistProperties,
  },
}

export const findAllGroups = async () => {
  const data = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    select: publicGroupProperties,
  })

  return data
}

export const createGroup = async ({ title, userId }) => {
  const createdAt = new Date()
  const data = await prisma.group.create({
    data: {
      title,
      createdAt,
      userId,
    },
  })

  return data
}
