import { Resend } from "resend"

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined
}

export const resend =
  globalForResend.resend ?? new Resend(process.env.RESEND_API_KEY)

if (process.env.NODE_ENV !== "production") globalForResend.resend = resend
