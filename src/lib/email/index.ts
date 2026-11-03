import "server-only"

import { getTranslations } from "next-intl/server"
import { ContactEmail, DrawLotsEmail, RemindUserEmail } from "./templates"
import type { contactTopics } from "@/lib/schema"
import { resend } from "@/lib/resend"
import { getFirstName } from "@/lib/users/getFirstName"

interface SendReminder {
  toUser: {
    firstName: string | null
    name: string | null
    email: string | null
  }
  wishlist: {
    id: string
    // Who the list is for, or null when it's the recipient's own list
    name: string | null
  }
}

export const sendReminder = async ({ toUser, wishlist }: SendReminder) => {
  try {
    const t = await getTranslations("EmailReminder")

    const { error } = await resend.emails.send({
      from: "Niet Weer Sokken <no-reply@nietweersokken.nl>",
      to: [toUser.email!],
      subject: wishlist.name
        ? t("other.subject", { list: wishlist.name })
        : t("own.subject"),
      react: await RemindUserEmail({
        userName: getFirstName(toUser),
        wishlist,
      }),
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
    from: "Niet Weer Sokken <no-reply@nietweersokken.nl>",
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
      from: "Niet Weer Sokken <no-reply@nietweersokken.nl>",
      to: [to],
      subject: t(subject, { name: props.name, group: props.group.title }),
      react: await DrawLotsEmail(props),
    })

    if (error) throw error
  } catch (error) {
    console.error(error)
  }
}
