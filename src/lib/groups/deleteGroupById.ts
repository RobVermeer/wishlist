"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { groupProperties } from "./publicProperties"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"

export const deleteGroupById = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const groupToDelete = await prisma.group.findUnique({
      select: groupProperties,
      where: { id },
    })

    const userId = session.user.id

    if (!groupToDelete) {
      throw new Error(t("group.notFound"))
    }

    if (groupToDelete?.createdBy.id !== userId && !session.user.isAdmin) {
      throw new Error(t("noAccess"))
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
