"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export const deleteUserById = async (id: string) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Not logged in")
  }

  if (!session.user.isAdmin) {
    throw new Error("Access forbidden")
  }

  const data = await prisma.user.delete({
    where: { id },
  })

  revalidatePath("/")

  return data
}
