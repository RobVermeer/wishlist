"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"

export const leaveGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const groupToLeave = await prisma.group.findUnique({
      where: {
        id,
      },
    })

    if (!groupToLeave) {
      throw new Error("Groep niet gevonden")
    }

    await prisma.group.update({
      where: { id },
      data: {
        members: { disconnect: [{ id: userId }] },
      },
      select: groupProperties,
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    console.error("Leave group by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
