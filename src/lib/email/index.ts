"use server"

import { Resend } from "resend"
import DrawUserEmail from "./templates"
import { prisma } from "@/lib/prisma"
import { getErrorMessage, shuffle } from "@/lib/utils"
import { User } from "@prisma/client"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmailToUsers = async (groupId: string, formData: FormData) => {
  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: true,
      },
    })

    if (!group) {
      throw new Error("No group found")
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
      const userName = (person1.firstName ?? person1.name)!
      const forName = (person2.firstName ?? person2.name)!

      await resend.emails.send({
        from: "Wishlist <no-reply@ru-coding.nl>",
        to: [person1.email!],
        subject: `${userName}, je hebt een lootje getrokken voor ${groupName}`,
        react: DrawUserEmail({
          userName,
          forName,
          groupId,
          groupName,
        }),
      })
    })

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
