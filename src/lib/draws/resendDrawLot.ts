"use server"

import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { sendDrawLotsEmail } from "@/lib/email"
import { getErrorMessage } from "@/lib/utils"
import { getFirstName } from "@/lib/users/getFirstName"

const day = 24 * 60 * 60 * 1000

export const resendDrawLot = async (participantId: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const participant = await prisma.drawParticipant.findFirst({
      where: {
        id: participantId,
        userId: null,
        draw: {
          cancelledAt: null,
          group: { removed: false, userId: session.user.id },
        },
      },
      select: {
        name: true,
        email: true,
        lastSentAt: true,
        receiver: { select: { name: true } },
        draw: {
          select: {
            budget: true,
            date: true,
            group: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!participant?.receiver) {
      throw new Error(t("draw.participantNotFound"))
    }

    if (
      participant.lastSentAt &&
      Date.now() - participant.lastSentAt.getTime() < day
    ) {
      throw new Error(t("draw.alreadySent"))
    }

    await sendDrawLotsEmail({
      to: participant.email,
      name: participant.name,
      receiver: participant.receiver.name,
      group: participant.draw.group,
      creator: getFirstName({
        firstName: session.user.firstName ?? null,
        name: session.user.name ?? null,
      }),
      budget: participant.draw.budget,
      date: participant.draw.date,
      redraw: false,
      member: false,
    })

    await prisma.drawParticipant.update({
      where: { id: participantId },
      data: { lastSentAt: new Date() },
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
