"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { groupProperties } from "./publicProperties"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const unDeleteGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const groupToUpdate = await prisma.group.findUnique({
      select: groupProperties,
      where: { id },
    })

    const userId = session.user.id

    if (!groupToUpdate) {
      throw new Error(t("group.notFound"))
    }

    if (groupToUpdate?.createdBy.id !== userId && !session.user.isAdmin) {
      throw new Error(t("noAccess"))
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
    trackIssue("Un delete group by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
