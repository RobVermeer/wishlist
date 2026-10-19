import "server-only"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { cache } from "react"
import { getTranslations } from "next-intl/server"
import { getFirstName } from "./getFirstName"

export const getManagerOptionsForUser = cache(async (wishlistId?: string) => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  const userId = session.user.id

  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, name: true },
    where: {
      NOT: { id: userId },
      OR: [
        {
          subscribed: {
            some: { removed: false, members: { some: { id: userId } } },
          },
        },
        ...(wishlistId ? [{ managing: { some: { id: wishlistId } } }] : []),
      ],
    },
  })

  return users
    .map(user => ({ id: user.id, name: getFirstName(user) }))
    .filter(({ name }) => name)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"))
})

export type ManagerOption = Awaited<
  ReturnType<typeof getManagerOptionsForUser>
>[number]
