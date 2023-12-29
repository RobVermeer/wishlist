"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"
import { getTranslations } from "next-intl/server"

export const getGroupById = cache(async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const data = await prisma.group.findUnique({
      select: groupProperties,
      where: { id, removed: false },
    })

    if (!data) {
      throw new Error(t("group.notFound"))
    }

    const wishlist = data.wishlist.map((wishlist) => ({
      ...wishlist,
      isOwnList: wishlist.user.id === userId,
    }))

    const subscribed = data.members.some(
      ({ id }: { id: string }) => id === userId
    )

    return { ...data, wishlist, subscribed }
  } catch {
    return null
  }
})
