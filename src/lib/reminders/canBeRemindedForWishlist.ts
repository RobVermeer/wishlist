import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export const canBeRemindedForWishlist = async (
  wishlistId: string,
  db: Prisma.TransactionClient = prisma
) => {
  const remindTimeout = new Date()

  remindTimeout.setHours(remindTimeout.getHours() - 24)

  const count = await db.reminder.count({
    where: {
      createdAt: {
        gte: remindTimeout,
      },
      wishlistId,
    },
  })

  return count === 0
}
