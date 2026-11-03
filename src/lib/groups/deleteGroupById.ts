"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

export const deleteGroupById = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id
    const groupToDelete = await prisma.group.findUnique({
      select: { id: true },
      where: { id, ...(session.user.isAdmin ? {} : { userId }) },
    })

    if (!groupToDelete) {
      throw new Error(t("group.notFound"))
    }

    await prisma.group.update({
      data: { removed: true },
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
