import "server-only"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/getSession"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getGroupsForUser = cache(async () => {
  const session = await getSession()
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  return prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      theme: true,
      _count: { select: { members: true } },
    },
    where: {
      members: {
        some: { id: userId },
      },
      removed: false,
    },
  })
})
