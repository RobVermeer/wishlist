import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Landing } from "@/components/Landing"
import { authOptions } from "@/lib/nextAuth"
import { getLocalPath } from "@/lib/utils"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

// The same landing page as the home page, which search engines should show.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default async function Login({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const { callbackUrl = "/" } = await searchParams

  if (session) {
    redirect(getLocalPath(callbackUrl))
  }

  return <Landing />
}
