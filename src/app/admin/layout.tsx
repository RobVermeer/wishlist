import { AdminTabs } from "@/components/AdminTabs"
import { Layout } from "@/components/Layout"
import { ListTitle } from "@/components/ListTitle"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"

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
      <Header session={session} />

      <Layout>
        <ListTitle>Admin</ListTitle>

        <AdminTabs />

        {children}
      </Layout>
    </>
  )
}
