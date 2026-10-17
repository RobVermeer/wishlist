import "server-only"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getGroupOptionsForUser = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      wishlist: {
        select: { id: true },
        where: { userId, title: null, removed: false },
      },
    },
    where: { members: { some: { id: userId } }, removed: false },
  })

  return groups.map(({ id, title, wishlist }) => ({
    id,
    title,
    ownWishlistIds: wishlist.map(({ id }) => id),
  }))
})

export type GroupOption = Awaited<
  ReturnType<typeof getGroupOptionsForUser>
>[number]
