"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { cache } from "react"

export const getUsers = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  if (!session.user.isAdmin) {
    throw new Error(t("noAccess"))
  }

  const data = await prisma.user.findMany({
    orderBy: { id: "desc" },
  })

  return data
})
