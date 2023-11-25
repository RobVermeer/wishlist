"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { resend } from "@/lib/resend"
import { RemindUserEmail } from "@/lib/email/templates"

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

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const canBeReminded = await canBeRemindedForUser(to)

    if (!canBeReminded) {
      throw new Error("Er is al een reminder verstuurd")
    }

    const from = session.user.id

    const toUser = await prisma.user.findUnique({
      where: {
        id: to,
      },
    })

    if (!toUser) {
      throw new Error("Gebruiker niet gevonden")
    }

    const userName = (toUser.firstName ?? toUser.name)!

    await resend.emails.send({
      from: "Wishlist <no-reply@ru-coding.nl>",
      to: [toUser.email!],
      subject: "Heb je nog wensen?",
      react: RemindUserEmail({ userName }),
    })

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
