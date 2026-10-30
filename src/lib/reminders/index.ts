"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { sendReminder } from "@/lib/email"
import { canBeRemindedForUser } from "./canBeRemindedForUser"
import { sharedWithUser } from "@/lib/wishlists/visibility"

export const sendReminderToUser = async (to: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const from = session.user.id

    const sharedWishlist = await prisma.wishlist.findFirst({
      where: {
        userId: { equals: to, not: from },
        removed: false,
        ...sharedWithUser(from),
      },
    })

    if (!sharedWishlist) {
      throw new Error(t("user.notFound"))
    }

    const canBeReminded = await canBeRemindedForUser(to)

    if (!canBeReminded) {
      throw new Error(t("reminder.alreadySent"))
    }

    const toUser = await prisma.user.findUnique({
      where: {
        id: to,
      },
    })

    if (!toUser) {
      throw new Error(t("user.notFound"))
    }

    const userName = (toUser.firstName ?? toUser.name)!

    await sendReminder({ toUser, userName })

    await prisma.reminder.create({
      data: {
        to,
        from,
      },
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
