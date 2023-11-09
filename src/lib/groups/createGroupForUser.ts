"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { groupSchema } from "@/lib/schema"
import { getErrorMessage } from "@/lib/utils"
import { z } from "zod"

export const createGroupForUser = async (formData: FormData) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id
    const data = groupSchema.parse(Object.fromEntries(formData.entries()))

    await prisma.group.create({
      select: groupProperties,
      data: {
        ...data,
        members: { connect: [{ id: userId }] },
        createdAt: new Date(),
        userId,
      },
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

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
