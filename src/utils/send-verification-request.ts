import { SendVerificationRequestParams } from "next-auth/providers/email"
import { resend } from "@/lib/resend"
import { LoginWithEmail } from "@/lib/email/templates"
import { getTranslations } from "next-intl/server"

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams
) => {
  const { url } = params
  const t = await getTranslations("EmailLogin")

  try {
    await resend.emails.send({
      from: "Wishlist <no-reply@ru-coding.nl>",
      to: params.identifier,
      subject: t("subject"),
      react: await LoginWithEmail({ url }),
    })
  } catch (error) {
    console.log({ error })
  }
}
