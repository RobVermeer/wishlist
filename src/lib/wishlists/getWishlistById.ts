"use server"

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { getTranslations } from "next-intl/server"

export const getWishlistById = cache(
  async (id: string, isOwnList: boolean = false) => {
    try {
      const session = await getServerSession(authOptions)
      const t = await getTranslations("Errors")

      if (!session) {
        throw new Error(t("notLoggedIn"))
      }

      const userId = session.user.id
      const data = await prisma.wishlist.findUnique({
        select: wishlistProperties,
        where: { id, removed: false },
      })

      if (!data) {
        throw new Error(t("wishlist.notFound"))
      }

      if (isOwnList && data.user.id !== userId) {
        throw new Error(t("noAccess"))
      }

      return { ...data, isOwnList: data.user.id === userId }
    } catch {
      return null
    }
  }
)
