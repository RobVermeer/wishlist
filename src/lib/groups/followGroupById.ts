"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

export const followGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const groupToFollow = await prisma.group.findUnique({
      where: {
        id,
        removed: false,
      },
    })

    if (!groupToFollow) {
      throw new Error(t("group.notFound"))
    }

    await prisma.group.update({
      where: { id },
      data: {
        members: { connect: [{ id: userId }] },
      },
      select: groupProperties,
    })

    const email = session.user.email?.toLowerCase()

    if (email) {
      await prisma.drawParticipant.updateMany({
        where: {
          userId: null,
          email,
          draw: { groupId: id, cancelledAt: null },
        },
        data: { userId },
      })
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
