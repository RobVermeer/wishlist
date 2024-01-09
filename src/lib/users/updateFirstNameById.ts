"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"
import { trackIssue } from "@/lib/trackIssue"

export const updateFirstNameById = async (id: string, firstName: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (session.user.id !== id) {
      throw new Error(t("noAccess"))
    }

    await prisma.user.update({
      data: { firstName },
      where: { id },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Update first name by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
