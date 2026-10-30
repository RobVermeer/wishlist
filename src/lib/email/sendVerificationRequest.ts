import { SendVerificationRequestParams } from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { LoginWithEmail } from "@/lib/email/templates"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

const tenMinutes = 10 * 60 * 1000

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams
) => {
  const { identifier, url, expires } = params
  const t = await getTranslations("EmailLogin")

  const recentEmails = await prisma.verificationToken.count({
    where: {
      identifier,
      expires: { gte: new Date(expires.getTime() - tenMinutes), lt: expires },
    },
  })

  if (recentEmails >= 3) {
    trackIssue("Too many login e-mails", "warn", { identifier })
    return
  }

  try {
    const { error } = await resend.emails.send({
      from: "Niet Weer Sokken <no-reply@ru-coding.nl>",
      to: identifier,
      subject: t("subject"),
      react: await LoginWithEmail({ url }),
    })

    if (error) throw error
  } catch (error) {
    console.log({ error })
  }
}
