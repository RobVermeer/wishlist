"use server"

import * as z from "zod"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { authOptions } from "@/lib/nextAuth"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/schema"
import { sendContactEmail } from "@/lib/email"
import { getErrorMessage } from "@/lib/utils"
import { getFirstName } from "@/lib/users/getFirstName"

export const sendContactMessage = async (data: FormData) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const { topic, message } = contactSchema.parse({
      topic: data.get("topic")?.toString(),
      message: data.get("message")?.toString() ?? "",
    })

    const admin = await prisma.user.findUnique({
      where: { id: process.env.ADMIN_USER_ID ?? "" },
      select: { email: true },
    })

    if (!admin?.email) {
      throw new Error(t("contact.failed"))
    }

    const { id, email, name, firstName } = session.user

    await sendContactEmail({
      to: admin.email,
      from: {
        id,
        email: email ?? "",
        name: getFirstName({
          firstName: firstName ?? null,
          name: name ?? null,
        }),
      },
      topic,
      message,
    })

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
