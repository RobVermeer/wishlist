import "server-only"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getSession } from "@/lib/getSession"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getGroups = cache(async () => {
  const session = await getSession()
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  if (!session.user.isAdmin) {
    throw new Error(t("noAccess"))
  }

  const data = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    select: { ...groupProperties, removed: true },
  })

  return data
})
