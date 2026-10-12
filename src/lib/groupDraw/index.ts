"use server"

import { prisma } from "@/lib/prisma"
import { getErrorMessage, shuffle } from "@/lib/utils"
import { User } from "@/generated/prisma/client"
import { sendGroupDraw } from "@/lib/email"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"

export const groupDraw = async (groupId: string, formData: FormData) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session?.user.isAdmin) {
      throw new Error(t("noAccess"))
    }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
        removed: false,
      },
      include: {
        members: true,
      },
    })

    if (!group) {
      throw new Error(t("group.notFound"))
    }

    const groupName = group.title
    const users = formData.getAll("users[]")
    const usersInDrawingList = group.members.filter(({ id }) =>
      users.includes(id)
    )

    if (usersInDrawingList.length < 2) {
      throw new Error(t("draw.tooFewParticipants"))
    }

    let receivers: User[]

    do {
      receivers = shuffle([...usersInDrawingList])
    } while (
      receivers.some(({ id }, index) => id === usersInDrawingList[index].id)
    )

    await Promise.all(
      usersInDrawingList.map((person1, index) =>
        sendGroupDraw({
          person1,
          person2: receivers[index],
          groupId,
          groupName,
        })
      )
    )

    trackIssue("Email group draw sent", "info", { groupId, groupName })

    return {
      type: "success" as const,
    }
  } catch (error) {
    trackIssue("Email group draw error", "error", { error, groupId })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
