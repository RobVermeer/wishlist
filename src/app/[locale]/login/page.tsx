import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { LoginForm } from "@/components/LoginForm"
import { authOptions } from "@/lib/nextAuth"
import { getLocalPath } from "@/lib/utils"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function Login({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const { callbackUrl = "/" } = await searchParams

  if (session) {
    redirect(getLocalPath(callbackUrl))
  }

  return <LoginForm />
}
