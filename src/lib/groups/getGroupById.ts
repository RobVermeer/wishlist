"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { cache } from "react"

export const getGroupById = cache(async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const data = await prisma.group.findUnique({
      select: groupProperties,
      where: { id },
    })

    if (!data) {
      throw new Error("Groep niet gevonden")
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
