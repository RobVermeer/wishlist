import "server-only"

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

    const group = await prisma.group.findUnique({
      select: {
        id: true,
        title: true,
        members: { where: { id: userId }, select: { id: true } },
      },
      where: { id, removed: false },
    })

    if (!group) {
      throw new Error(t("group.notFound"))
    }

    // Who isn't a member only gets what the invite shows.
    if (group.members.length === 0) {
      return { id: group.id, title: group.title, subscribed: false as const }
    }

    const data = await prisma.group.findUnique({
      select: groupProperties,
      where: { id, removed: false, members: { some: { id: userId } } },
    })

    if (!data) {
      throw new Error(t("group.notFound"))
    }

    const wishlist = data.wishlist.map(wishlist => ({
      ...wishlist,
      isOwnList:
        wishlist.user.id === userId ||
        wishlist.managers.some(({ id }) => id === userId),
    }))

    return { ...data, wishlist, subscribed: true as const }
  } catch {
    return null
  }
})
