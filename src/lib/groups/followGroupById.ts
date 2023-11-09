"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"

export const followGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const groupToFollow = await prisma.group.findUnique({
      where: {
        id,
      },
    })

    if (!groupToFollow) {
      throw new Error("Groep niet gevonden")
    }

    await prisma.group.update({
      where: { id },
      data: {
        members: { connect: [{ id: userId }] },
      },
      select: groupProperties,
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
