import { AdminTabs } from "@/components/AdminTabs"
import { Layout } from "@/components/Layout"
import { ListTitle } from "@/components/ListTitle"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function ProfileLayout({ children }: Props) {
  return (
    <Layout>
      <ListTitle>Admin</ListTitle>

      <AdminTabs />

      {children}
    </Layout>
  )
}
