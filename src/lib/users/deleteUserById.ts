"use server"

import { rm } from "fs/promises"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"
import { avatarFolder } from "@/lib/users/avatarFolder"

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

    const user = await prisma.user.delete({
      where: { id },
      select: { id: true },
    })
    await rm(avatarFolder(user.id), { recursive: true, force: true }).catch(
      error => trackIssue("Remove avatars of deleted user", "error", { error })
    )

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Delete user by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
