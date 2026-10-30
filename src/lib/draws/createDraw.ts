"use server"

import * as z from "zod"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { drawSchema } from "@/lib/schema"
import { sendDrawLotsEmail } from "@/lib/email"
import { getErrorMessage } from "@/lib/utils"
import { getFirstName } from "@/lib/users/getFirstName"
import { drawLots, maxParticipants } from "./drawLots"

export const createDraw = async (groupId: string, data: FormData) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const group = await prisma.group.findFirst({
      where: { id: groupId, removed: false, userId: session.user.id },
      select: {
        id: true,
        title: true,
        members: {
          select: { id: true, firstName: true, name: true, email: true },
        },
      },
    })

    if (!group) {
      throw new Error(t("group.notFound"))
    }

    const extraNames = data.getAll("extraName").map(name => name.toString())
    const previousIds = data.getAll("previous").map(id => id.toString())
    const previous = previousIds.length
      ? await prisma.drawParticipant.findMany({
          where: {
            id: { in: previousIds },
            userId: null,
            draw: { groupId, cancelledAt: null },
          },
          select: { name: true, email: true },
        })
      : []
    const { members, extra, budget, date } = drawSchema.parse({
      members: data.getAll("members").map(member => member.toString()),
      extra: [
        ...previous,
        ...data.getAll("extraEmail").map((email, index) => ({
          name: extraNames[index] ?? "",
          email: email.toString().trim(),
        })),
      ],
      budget: data.get("budget")?.toString() || undefined,
      date: data.get("date")?.toString() || undefined,
    })

    const extraMemberIds = group.members
      .filter(member => extra.some(({ email }) => email === member.email))
      .map(({ id }) => id)
    const participants: {
      name: string
      email: string
      userId: string | null
    }[] = [
      ...group.members
        .filter(
          member =>
            (members.includes(member.id) ||
              extraMemberIds.includes(member.id)) &&
            member.email
        )
        .map(member => ({
          name: getFirstName(member),
          email: member.email!.toLowerCase(),
          userId: member.id,
        })),
      ...extra
        .filter(({ email }) =>
          group.members.every(member => member.email !== email)
        )
        .map(({ name, email }) => ({ name, email, userId: null })),
    ]

    if (
      new Set(participants.map(({ email }) => email)).size !==
        participants.length ||
      new Set(extra.map(({ email }) => email)).size !== extra.length
    ) {
      throw new Error(t("draw.duplicateEmail"))
    }

    if (participants.length < 2) {
      throw new Error(t("draw.tooFewParticipants"))
    }

    if (participants.length > maxParticipants) {
      throw new Error(t("draw.tooManyParticipants", { max: maxParticipants }))
    }

    const receivers = drawLots(participants.length)
    const now = new Date()

    const { redraw } = await prisma.$transaction(async tx => {
      const { count } = await tx.draw.updateMany({
        where: { groupId, cancelledAt: null },
        data: { cancelledAt: now },
      })
      const draw = await tx.draw.create({
        data: {
          groupId,
          createdAt: now,
          budget: budget ?? null,
          date: date ? new Date(date) : null,
        },
      })
      const rows = []

      for (const participant of participants) {
        rows.push(
          await tx.drawParticipant.create({
            data: { ...participant, drawId: draw.id, lastSentAt: now },
          })
        )
      }

      for (const [index, row] of rows.entries()) {
        await tx.drawParticipant.update({
          where: { id: row.id },
          data: { receiverId: rows[receivers[index]].id },
        })
      }

      return { redraw: count > 0 }
    })

    const creator = getFirstName({
      firstName: session.user.firstName ?? null,
      name: session.user.name ?? null,
    })

    await Promise.all(
      participants.map((participant, index) =>
        sendDrawLotsEmail({
          to: participant.email,
          name: participant.name,
          receiver: participants[receivers[index]].name,
          group,
          creator,
          budget: budget ?? null,
          date: date ? new Date(date) : null,
          redraw,
          member: participant.userId !== null,
        })
      )
    )

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: "error" as const,
        errors: error.issues.map(issue => issue.message),
      }
    }

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
