import "server-only"

import { prisma } from "@/lib/prisma"

export const canBeRemindedForUser = async (to: string) => {
  const remindTimeout = new Date()

  remindTimeout.setHours(remindTimeout.getHours() - 24)

  const count = await prisma.reminder.count({
    where: {
      createdAt: {
        gte: remindTimeout,
      },
      to,
    },
  })

  return count === 0
}
