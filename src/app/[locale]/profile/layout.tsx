import { ListTitle } from "@/components/ListTitle"
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
      <ListTitle>{t("title")}</ListTitle>

      <ProfileTabs />

      {children}
    </>
  )
}
