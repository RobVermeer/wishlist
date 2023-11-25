"use server"

import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { groupProperties } from "./publicProperties"
import { getErrorMessage } from "@/lib/utils"

export const deleteGroupById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const groupToDelete = await prisma.group.findUnique({
      select: groupProperties,
      where: { id },
    })

    const userId = session.user.id

    if (!groupToDelete) {
      throw new Error("Groep niet gevonden")
    }

    if (groupToDelete?.createdBy.id !== userId && !session.user.isAdmin) {
      throw new Error("Je hebt niet de juiste rechten om dit te doen")
    }

    await prisma.group.delete({
      where: { id },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    console.error("Delete group by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
