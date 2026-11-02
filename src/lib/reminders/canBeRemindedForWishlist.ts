import "server-only"

import { prisma } from "@/lib/prisma"

export const canBeRemindedForWishlist = async (wishlistId: string) => {
  const remindTimeout = new Date()

  remindTimeout.setHours(remindTimeout.getHours() - 24)

  const count = await prisma.reminder.count({
    where: {
      createdAt: {
        gte: remindTimeout,
      },
      wishlistId,
    },
  })

  return count === 0
}
