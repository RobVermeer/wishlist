"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getGroups = cache(async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const data = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    select: groupProperties,
  })

  return data
})
