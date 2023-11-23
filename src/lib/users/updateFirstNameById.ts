"use server"

import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export const updateFirstNameById = async (
  id: string,
  firstName: string,
  lastName?: string
) => {
  try {
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
