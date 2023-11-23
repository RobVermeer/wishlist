import { SendVerificationRequestParams } from "next-auth/providers/email"
import { resend } from "@/lib/resend"
import { LoginWithEmail } from "@/lib/email/templates"

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams
) => {
  const { url } = params

  try {
    await resend.emails.send({
      from: "Wishlist <no-reply@ru-coding.nl>",
      to: params.identifier,
      subject: "Inloggen Wishlist",
      react: LoginWithEmail({ url }),
    })
  } catch (error) {
    console.log({ error })
  }
}
