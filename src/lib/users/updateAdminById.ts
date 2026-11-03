"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { adminSchema } from "@/lib/schema"
import { isSuperAdmin } from "./isSuperAdmin"
import * as z from "zod"
import { translateIssues } from "@/lib/translateIssues"

export const updateAdminById = async (id: string, isAdmin: boolean) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (!session.user.isSuperAdmin || isSuperAdmin(id)) {
      throw new Error(t("noAccess"))
    }

    const data = adminSchema.parse({ isAdmin })

    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!userToUpdate) {
      throw new Error(t("user.notFound"))
    }

    await prisma.user.update({
      where: { id },
      data,
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: "error" as const,
        errors: translateIssues(error, await getTranslations("Validation")),
      }
    }

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
