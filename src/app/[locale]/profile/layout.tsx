import { ListTitle } from "@/components/ListTitle"
import { ProfileTabs } from "@/components/ProfileTabs"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default async function ProfileLayout({ children }: Props) {
  return (
    <>
      <ListTitle>Profiel</ListTitle>

      <ProfileTabs />

      {children}
    </>
  )
}
