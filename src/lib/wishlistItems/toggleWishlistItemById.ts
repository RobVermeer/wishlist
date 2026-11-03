"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser, sharedWithUser } from "@/lib/wishlists/visibility"
import * as z from "zod"

export const toggleWishlistItemById = async (id: string, bought: boolean) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id
    const buy = z.boolean().parse(bought)

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        id,
        removed: false,
        unlimited: false,
        wishlist: {
          removed: false,
          NOT: managedByUser(userId),
          ...sharedWithUser(userId),
        },
      },
      select: wishlistItemProperties,
    })

    if (!wishlistItem) {
      throw new Error(t("item.notFound"))
    }

    const boughtByMe = wishlistItem.boughtBy?.id === userId

    if (wishlistItem.boughtBy && !boughtByMe) {
      throw new Error(t("item.alreadyBought"))
    }

    // Buying or undoing it twice, with a double tap, changes nothing. The
    // write checks the buyer again, so of people buying at the same moment
    // only one gets the wish.
    if (buy !== boughtByMe) {
      const { count } = await prisma.wishlistItem.updateMany({
        where: { id, OR: [{ userId: null }, { userId }] },
        data: buy
          ? { userId, boughtAt: new Date() }
          : { userId: null, boughtAt: null },
      })

      if (count === 0) {
        throw new Error(t("item.alreadyBought"))
      }
    }

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
