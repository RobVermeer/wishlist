"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { sendDrawLotsEmail } from "@/lib/email"
import { getErrorMessage } from "@/lib/utils"
import { getFirstName } from "@/lib/users/getFirstName"

const day = 24 * 60 * 60 * 1000

export const resendDrawLot = async (participantId: string) => {
  try {
    const session = await getSession()
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

    // Marking the lootje as sent before sending it, only when it wasn't sent
    // in the last day, sends it once when the button is pressed twice at the
    // same moment.
    const { count } = await prisma.drawParticipant.updateMany({
      where: {
        id: participantId,
        OR: [
          { lastSentAt: null },
          { lastSentAt: { lte: new Date(Date.now() - day) } },
        ],
      },
      data: { lastSentAt: new Date() },
    })

    if (count === 0) {
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
