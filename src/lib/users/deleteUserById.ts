"use server"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { isSuperAdmin } from "./isSuperAdmin"

export const deleteUserById = async (id: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    if (!session.user.isAdmin) {
      throw new Error(t("noAccess"))
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true },
    })

    if (!userToDelete) {
      throw new Error(t("user.notFound"))
    }

    // Only the super admin removes admins, and nobody removes the super admin.
    if (
      isSuperAdmin(id) ||
      (userToDelete.isAdmin && !session.user.isSuperAdmin)
    ) {
      throw new Error(t("noAccess"))
    }

    // Groups with other members go to the member who was there last, so
    // they keep their verlanglijstjes and lootjes. The rest go with the user.
    const groups = await prisma.group.findMany({
      where: {
        userId: id,
        removed: false,
        members: { some: { id: { not: id } } },
      },
      select: {
        id: true,
        members: {
          where: { id: { not: id } },
          select: { id: true },
          orderBy: { lastSeenAt: { sort: "desc", nulls: "last" } },
          take: 1,
        },
      },
    })

    await prisma.$transaction([
      ...groups.map(group =>
        prisma.group.update({
          where: { id: group.id },
          data: { userId: group.members[0].id },
        })
      ),
      // What this user bought stays bought for the others, through its date
      // of buying. Wishes bought before that date was kept get the date they
      // were made, so they are cleaned up after a party like before.
      prisma.$executeRaw`
        UPDATE "WishlistItem" SET "boughtAt" = "createdAt"
        WHERE "userId" = ${id} AND "boughtAt" IS NULL
      `,
      prisma.reminder.deleteMany({
        where: { OR: [{ to: id }, { from: id }] },
      }),
      prisma.user.delete({ where: { id } }),
    ])

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
