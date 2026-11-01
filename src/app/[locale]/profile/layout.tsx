import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { ProfileBreadcrumbs } from "@/components/ProfileBreadcrumbs"
import { ProfileTabs } from "@/components/ProfileTabs"
import { useTranslations } from "next-intl"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function ProfileLayout({ children }: Props) {
  const t = useTranslations("Profile")

  return (
    <>
      <List>
        <ProfileBreadcrumbs />
        <ListTitle>{t("title")}</ListTitle>
      </List>

      <ProfileTabs />

      {children}
    </>
  )
}
