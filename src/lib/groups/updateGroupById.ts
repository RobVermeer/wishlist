"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { groupSchema } from "@/lib/schema"
import { getErrorMessage } from "@/lib/utils"
import { z } from "zod"

export const updateGroupById = async (id: string, formData: FormData) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const groupToUpdate = await prisma.group.findUnique({
      where: {
        id,
        createdBy: { id: userId },
      },
    })

    if (!groupToUpdate) {
      throw new Error("Groep niet gevonden")
    }

    const data = groupSchema.parse(Object.fromEntries(formData.entries()))

    await prisma.group.update({
      where: { id },
      data: {
        title: data.title,
        theme: data.theme === "default" ? null : data.theme,
      },
      select: groupProperties,
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: "error" as const,
        errors: error.issues.map((issue) => issue.message),
      }
    }

    console.error("Update group by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
