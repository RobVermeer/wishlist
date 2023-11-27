"use server"

import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { useTranslations } from "next-intl"
import { cache } from "react"

export const getUsers = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = useTranslations("Errors")

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
