import "server-only"

import { Prisma } from "@/generated/prisma/client"

export async function keepOneOwnWishlistPerGroup(
  tx: Prisma.TransactionClient,
  userId: string,
  wishlistId: string,
  groupIds: string[] = []
) {
  if (groupIds.length === 0) return

  const others = await tx.wishlist.findMany({
    where: {
      userId,
      title: null,
      id: { not: wishlistId },
      groups: { some: { id: { in: groupIds } } },
    },
    select: { id: true },
  })

  for (const { id } of others) {
    await tx.wishlist.update({
      where: { id },
      data: { groups: { disconnect: groupIds.map(id => ({ id })) } },
    })
  }
}
