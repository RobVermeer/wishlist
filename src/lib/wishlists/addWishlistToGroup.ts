"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { keepOneOwnWishlistPerGroup } from "./keepOneOwnWishlistPerGroup"
import { managedByUser } from "./visibility"

export const addWishlistToGroup = async (
  wishlistId: string,
  groupId: string
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId, removed: false, ...managedByUser(userId) },
      select: { id: true, title: true },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId, removed: false, members: { some: { id: userId } } },
      select: { id: true },
    })

    if (!group) {
      throw new Error(t("group.notFound"))
    }

    await prisma.$transaction(async tx => {
      await tx.wishlist.update({
        where: { id: wishlistId },
        data: { groups: { connect: { id: groupId } } },
      })

      if (!wishlist.title) {
        await keepOneOwnWishlistPerGroup(tx, userId, wishlistId, [groupId])
      }
    })

    revalidatePath("/")

    return { type: "success" as const }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
