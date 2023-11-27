"use server"

import { getTranslations } from "next-intl/server"
import { DrawUserEmail, RemindUserEmail } from "./templates"
import { resend } from "@/lib/resend"

interface SendGroupDraw {
  person1: {
    firstName: string | null
    name: string | null
    email: string | null
  }
  person2: {
    firstName: string | null
    name: string | null
    email: string | null
  }
  groupId: string
  groupName: string
}

export const sendGroupDraw = async ({
  person1,
  person2,
  groupId,
  groupName,
}: SendGroupDraw) => {
  const userName = (person1.firstName ?? person1.name)!
  const forName = (person2.firstName ?? person2.name)!
  const t = await getTranslations("EmailDraw")

  await resend.emails.send({
    from: "Wishlist <no-reply@ru-coding.nl>",
    to: [person1.email!],
    subject: t("subject", {
      name: userName,
      group: groupName,
    }),
    react: await DrawUserEmail({
      userName,
      forName,
      groupId,
      groupName,
    }),
  })
}

interface SendReminder {
  toUser: {
    email: string | null
  }
  userName: string
}

export const sendReminder = async ({ toUser, userName }: SendReminder) => {
  const t = await getTranslations("EmailReminder")

  await resend.emails.send({
    from: "Wishlist <no-reply@ru-coding.nl>",
    to: [toUser.email!],
    subject: t("subject"),
    react: await RemindUserEmail({ userName }),
  })
}
