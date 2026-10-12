import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { LoginForm } from "@/components/LoginForm"
import { authOptions } from "@/lib/nextAuth"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function Login({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const { callbackUrl = "/" } = await searchParams
  const redirectTo = decodeURIComponent(callbackUrl).startsWith("/")
    ? callbackUrl
    : "/"

  if (session) {
    redirect(decodeURIComponent(redirectTo))
  }

  return <LoginForm />
}
