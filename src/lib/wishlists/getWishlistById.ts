"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"

export const getWishlistById = cache(
  async (id: string, isOwnList: boolean = false) => {
    try {
      const session = await getServerSession(authOptions)

      if (!session) {
        throw new Error("Je bent niet ingelogd")
      }

      const userId = session.user.id
      const data = await prisma.wishlist.findUnique({
        select: wishlistProperties,
        where: { id },
      })

      if (!data) {
        throw new Error("Verlanglijst is niet gevonden")
      }

      if (isOwnList && data.user.id !== userId) {
        throw new Error("Je hebt niet de juiste rechten om dit te doen")
      }

      return { ...data, isOwnList: data.user.id === userId }
    } catch {
      return null
    }
  }
)
