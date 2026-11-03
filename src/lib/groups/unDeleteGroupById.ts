"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

export const unDeleteGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id
    const groupToUpdate = await prisma.group.findUnique({
      select: { id: true },
      where: { id, ...(session.user.isAdmin ? {} : { userId }) },
    })

    if (!groupToUpdate) {
      throw new Error(t("group.notFound"))
    }

    await prisma.group.update({
      data: { removed: false },
      where: { id },
    })

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
