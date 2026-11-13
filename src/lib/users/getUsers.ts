import "server-only"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { isSuperAdmin } from "./isSuperAdmin"

export const getUsers = cache(async (search: string) => {
  const session = await getSession()
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  if (!session.user.isAdmin) {
    throw new Error(t("noAccess"))
  }

  const data = await prisma.user.findMany({
    where: search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {},
    orderBy: { id: "desc" },
  })

  return data.map(user => ({ ...user, isSuperAdmin: isSuperAdmin(user.id) }))
})
