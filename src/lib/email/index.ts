import "server-only"

import { getTranslations } from "next-intl/server"
import { ContactEmail, DrawUserEmail, RemindUserEmail } from "./templates"
import type { contactTopics } from "@/lib/schema"
import { resend } from "@/lib/resend"
import { trackIssue } from "@/lib/trackIssue"

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
  try {
    const userName = (person1.firstName ?? person1.name)!
    const forName = (person2.firstName ?? person2.name)!
    const t = await getTranslations("EmailDraw")

    const { error } = await resend.emails.send({
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

    if (error) throw error
  } catch (error) {
    trackIssue("Email group draw error", "error", {
      error,
      groupId,
      groupName,
      person1,
      person2,
    })
  }
}

interface SendReminder {
  toUser: {
    email: string | null
  }
  userName: string
}

export const sendReminder = async ({ toUser, userName }: SendReminder) => {
  try {
    const t = await getTranslations("EmailReminder")

    const { error } = await resend.emails.send({
      from: "Wishlist <no-reply@ru-coding.nl>",
      to: [toUser.email!],
      subject: t("subject"),
      react: await RemindUserEmail({ userName }),
    })

    if (error) throw error

    trackIssue("Email reminder sent", "info", { toUser, userName })
  } catch (error) {
    trackIssue("Email reminder error", "error", { toUser, userName, error })
  }
}

interface SendContactEmail {
  to: string
  from: { id: string; email: string; name: string }
  topic: (typeof contactTopics)[number]
  message: string
}

export const sendContactEmail = async ({
  to,
  from,
  topic,
  message,
}: SendContactEmail) => {
  const t = await getTranslations("EmailContact")

  const { error } = await resend.emails.send({
    from: "Wishlist <no-reply@ru-coding.nl>",
    to: [to],
    replyTo: from.email,
    subject: t(`subject.${topic}`, { name: from.name }),
    react: await ContactEmail({ from, topic, message }),
  })

  if (error) {
    trackIssue("Email contact message error", "error", { error, from, topic })
    const tErrors = await getTranslations("Errors")
    throw new Error(tErrors("contact.failed"))
  }
}
