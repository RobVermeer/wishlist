"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { adminSchema } from "@/lib/schema"
import { isSuperAdmin } from "./isSuperAdmin"
import * as z from "zod"

export const updateAdminById = async (id: string, isAdmin: boolean) => {
  try {
    const session = await getServerSession(authOptions)
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
        errors: error.issues.map(issue => issue.message),
      }
    }

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
