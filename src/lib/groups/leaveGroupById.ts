"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const leaveGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const groupToLeave = await prisma.group.findUnique({
      where: {
        id,
        removed: false,
      },
    })

    if (!groupToLeave) {
      throw new Error(t("group.notFound"))
    }

    const ownWishlists = await prisma.wishlist.findMany({
      where: { userId, groups: { some: { id } } },
      select: { id: true },
    })

    await prisma.group.update({
      where: { id },
      data: {
        members: { disconnect: [{ id: userId }] },
        wishlist: { disconnect: ownWishlists },
      },
      select: groupProperties,
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Leave group by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
