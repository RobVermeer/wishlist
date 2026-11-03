import { redirect } from "next/navigation"
import { Landing } from "@/components/Landing"
import { getSession } from "@/lib/getSession"
import { getLocalPath } from "@/lib/utils"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function Login({ searchParams }: Props) {
  const session = await getSession()
  const { callbackUrl = "/" } = await searchParams

  if (session) {
    redirect(getLocalPath(callbackUrl))
  }

  return <Landing callbackUrl={getLocalPath(callbackUrl)} />
}
