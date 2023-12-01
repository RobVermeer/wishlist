"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { sendReminder } from "@/lib/email"

export const canBeRemindedForUser = async (to: string) => {
  const remindTimeout = new Date()

  remindTimeout.setHours(remindTimeout.getHours() - 24)

  const count = await prisma.reminder.count({
    where: {
      createdAt: {
        gte: remindTimeout,
      },
      to,
    },
  })

  return count === 0
}

export const sendReminderToUser = async (to: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const canBeReminded = await canBeRemindedForUser(to)

    if (!canBeReminded) {
      throw new Error(t("reminder.alreadySent"))
    }

    const from = session.user.id

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
    console.error("Send reminder to user", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
