"use server"

import { prisma } from "@/lib/prisma"
import { getErrorMessage, shuffle } from "@/lib/utils"
import { User } from "@prisma/client"
import { sendGroupDraw } from "@/lib/email"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const groupDraw = async (groupId: string, formData: FormData) => {
  try {
    const t = await getTranslations("Errors")

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

    const drawUsers = (users: User[]) => {
      const shuffledUsers = shuffle([...users])

      return users.map((user, index) => ({
        person1: user,
        person2: shuffledUsers[index],
      }))
    }

    const getPairings = (users: User[]): { person1: User; person2: User }[] => {
      const pairings = drawUsers(users)

      if (pairings.some(({ person1, person2 }) => person1.id === person2.id)) {
        return getPairings(users)
      }

      return pairings
    }

    const pairings = getPairings(usersInDrawingList)

    pairings.forEach(async ({ person1, person2 }) => {
      await sendGroupDraw({ person1, person2, groupId, groupName })
    })

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
