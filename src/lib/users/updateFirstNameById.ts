"use server"

import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

export const updateFirstNameById = async (
  id: string,
  firstName: string,
  lastName?: string
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (session.user.id !== id) {
      throw new Error(t("noAccess"))
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    })

    const name = user.name || [firstName, lastName].filter(Boolean).join(" ")

    await prisma.user.update({
      data: { name, firstName },
      where: { id },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    console.error("Update first name by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
