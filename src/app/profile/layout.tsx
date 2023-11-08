import { Layout } from "@/components/Layout"
import { ListTitle } from "@/components/ListTitle"
import { ProfileTabs } from "@/components/ProfileTabs"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function ProfileLayout({ children }: Props) {
  return (
    <Layout>
      <ListTitle>Profiel</ListTitle>

      <ProfileTabs />

      {children}
    </Layout>
  )
}
