"use server"

import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { isSuperAdmin } from "./isSuperAdmin"

export const deleteUserById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (!session.user.isAdmin) {
      throw new Error(t("noAccess"))
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true },
    })

    if (!userToDelete) {
      throw new Error(t("user.notFound"))
    }

    // Only the super admin removes admins, and nobody removes the super admin.
    if (
      isSuperAdmin(id) ||
      (userToDelete.isAdmin && !session.user.isSuperAdmin)
    ) {
      throw new Error(t("noAccess"))
    }

    await prisma.user.delete({
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
