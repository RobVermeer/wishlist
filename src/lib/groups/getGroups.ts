"use server"

import { prisma } from "@/lib/prisma"
import { groupProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { cache } from "react"

export const getGroups = cache(async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Je bent niet ingelogd")
  }

  if (!session.user.isAdmin) {
    throw new Error("Je hebt niet de juiste rechten om dit te doen")
  }

  const data = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    select: groupProperties,
  })

  return data
})
