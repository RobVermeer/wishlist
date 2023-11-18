import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Header } from "@/components/Header"
import { Layout } from "@/components/Layout"
import { getGroupById } from "@/lib/groups/getGroupById"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  params: { groupId: string }
}

export default async function GroupLayout({ children, params }: Props) {
  const group = await getGroupById(params.groupId)
  const session = await getServerSession(authOptions)

  return (
    <>
      <Header session={session} group={group} />
      <Layout>{children}</Layout>
    </>
  )
}
