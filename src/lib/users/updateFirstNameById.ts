"use server"

import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/utils"

export const updateFirstNameById = async (id: string, firstName: string) => {
  try {
    await prisma.user.update({
      data: { firstName },
      where: { id },
    })

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
