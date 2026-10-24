"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"
import { getWishlistsLeavingGroup } from "./getWishlistsLeavingGroup"

export const removeMemberFromGroup = async (
  groupId: string,
  memberId: string
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
        members: { some: { id: memberId } },
      },
      select: { userId: true },
    })

    if (!group) {
      throw new Error(t("group.notFound"))
    }

    if (group.userId === memberId) {
      throw new Error(t("noAccess"))
    }

    const wishlistsToTakeOut = await getWishlistsLeavingGroup(groupId, memberId)

    await prisma.group.update({
      where: { id: groupId },
      data: {
        members: { disconnect: [{ id: memberId }] },
        wishlist: { disconnect: wishlistsToTakeOut },
      },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Remove member from group", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
