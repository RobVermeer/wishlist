import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { NextIntlClientProvider } from "next-intl"
import { pickMessages } from "@/utils/pick"
import { getMessages } from "next-intl/server"
import { LoginForm } from "@/components/LoginForm"
import { authOptions } from "@/lib/nextAuth"

interface Props {
  searchParams: { callbackUrl?: string }
}

export default async function Login({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const messages = await getMessages()
  const { callbackUrl = "/" } = searchParams
  const redirectTo = decodeURIComponent(callbackUrl).startsWith("/")
    ? callbackUrl
    : "/"

  if (session) {
    redirect(decodeURIComponent(redirectTo))
  }

  return (
    <NextIntlClientProvider messages={pickMessages(messages, "Login")}>
      <LoginForm />
    </NextIntlClientProvider>
  )
}
