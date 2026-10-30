import "server-only"

import { getTranslations } from "next-intl/server"
import {
  ContactEmail,
  DrawLotsEmail,
  DrawUserEmail,
  RemindUserEmail,
} from "./templates"
import type { contactTopics } from "@/lib/schema"
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
  try {
    const userName = (person1.firstName ?? person1.name)!
    const forName = (person2.firstName ?? person2.name)!
    const t = await getTranslations("EmailDraw")

    const { error } = await resend.emails.send({
      from: "Niet Weer Sokken <no-reply@ru-coding.nl>",
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
    console.error(error)
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
      from: "Niet Weer Sokken <no-reply@ru-coding.nl>",
      to: [toUser.email!],
      subject: t("subject"),
      react: await RemindUserEmail({ userName }),
    })

    if (error) throw error
  } catch (error) {
    console.error(error)
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
    from: "Niet Weer Sokken <no-reply@ru-coding.nl>",
    to: [to],
    replyTo: from.email,
    subject: t(`subject.${topic}`, { name: from.name }),
    react: await ContactEmail({ from, topic, message }),
  })

  if (error) {
    const tErrors = await getTranslations("Errors")
    throw new Error(tErrors("contact.failed"))
  }
}

interface SendDrawLotsEmail {
  to: string
  name: string
  receiver: string
  group: { id: string; title: string }
  creator: string
  budget: number | null
  date: Date | null
  redraw: boolean
  member: boolean
}

export const sendDrawLotsEmail = async ({
  to,
  ...props
}: SendDrawLotsEmail) => {
  try {
    const t = await getTranslations("EmailDrawLots")
    const subject = props.redraw ? "subject.redraw" : "subject.draw"

    const { error } = await resend.emails.send({
      from: "Niet Weer Sokken <no-reply@ru-coding.nl>",
      to: [to],
      subject: t(subject, { name: props.name, group: props.group.title }),
      react: await DrawLotsEmail(props),
    })

    if (error) throw error
  } catch (error) {
    console.error(error)
  }
}
