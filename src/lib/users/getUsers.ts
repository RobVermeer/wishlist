"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export const getUsers = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Je bent niet ingelogd")
  }

  if (!session.user.isAdmin) {
    throw new Error("Je hebt niet de juiste rechten om dit te doen")
  }

  const data = await prisma.user.findMany({
    orderBy: { name: "asc" },
  })

  return data
}
