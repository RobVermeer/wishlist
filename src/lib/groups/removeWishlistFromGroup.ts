"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const removeWishlistFromGroup = async (
  groupId: string,
  wishlistId: string
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        removed: false,
        ...(!session.user.isAdmin && { userId: session.user.id }),
        wishlist: { some: { id: wishlistId } },
      },
      select: { id: true },
    })

    if (!group) {
      throw new Error(t("group.notFound"))
    }

    await prisma.group.update({
      where: { id: groupId },
      data: { wishlist: { disconnect: [{ id: wishlistId }] } },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Remove wishlist from group", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
