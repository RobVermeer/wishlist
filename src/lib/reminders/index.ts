"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { sendReminder } from "@/lib/email"
import { trackIssue } from "@/lib/trackIssue"
import { canBeRemindedForUser } from "./canBeRemindedForUser"

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
    trackIssue("Send reminder to user", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
