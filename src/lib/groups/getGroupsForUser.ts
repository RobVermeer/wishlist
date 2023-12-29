"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getGroupsForUser = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    select: groupProperties,
    where: {
      members: {
        some: { id: userId },
      },
      removed: false,
    },
  })

  return groups.map((group) => ({
    ...group,
    isOwnGroup: group.createdBy.id === userId,
  }))
})
