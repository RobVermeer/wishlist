import { Header } from "@/components/Header"
import { Layout } from "@/components/Layout"
import { ListTitle } from "@/components/ListTitle"
import { ProfileTabs } from "@/components/ProfileTabs"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface Props {
  children: ReactNode
}

export default async function ProfileLayout({ children }: Props) {
  const session = await getServerSession(authOptions)

  return (
    <>
      <Header session={session} />
      <Layout>
        <ListTitle>Profiel</ListTitle>

        <ProfileTabs />

        {children}
      </Layout>
    </>
  )
}
