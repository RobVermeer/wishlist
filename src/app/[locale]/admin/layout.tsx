import { AdminTabs } from "@/components/AdminTabs"
import { ListTitle } from "@/components/ListTitle"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

interface Props {
  children: ReactNode
}

export default async function ProfileLayout({ children }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user.isAdmin) {
    redirect("/")
  }

  return (
    <>
      <ListTitle>Admin</ListTitle>

      <AdminTabs />

      {children}
    </>
  )
}
