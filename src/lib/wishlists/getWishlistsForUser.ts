"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { cache } from "react"

export const getWishlistsForUser = cache(async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Je bent niet ingelogd")
  }

  const userId = session.user.id

  const data = await prisma.wishlist.findMany({
    orderBy: { createdAt: "asc" },
    select: wishlistProperties,
    where: { userId },
  })

  const wishlists = data.map((wishlist) => ({
    ...wishlist,
    isOwnList: true,
  }))

  return wishlists
})
