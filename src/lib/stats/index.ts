import { prisma } from "@/lib/prisma"

export const getStats = async () => {
  const userCount = await prisma.user.count()
  const wishlistCount = await prisma.wishlist.count()
  const groupCount = await prisma.group.count()
  const itemCount = await prisma.wishlistItem.count()

  return { userCount, wishlistCount, groupCount, itemCount }
}
