import "server-only"

import { Prisma } from "@/generated/prisma/client"

export async function nextWishlistItemPosition(
  tx: Prisma.TransactionClient,
  wishlistId: string
) {
  const { _max } = await tx.wishlistItem.aggregate({
    where: { wishlistId },
    _max: { position: true },
  })

  return (_max.position ?? -1) + 1
}
