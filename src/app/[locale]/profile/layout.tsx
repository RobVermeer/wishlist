import { ListTitle } from "@/components/ListTitle"
import { ProfileTabs } from "@/components/ProfileTabs"
import { pickMessages } from "@/utils/pick"
import { NextIntlClientProvider, useMessages, useTranslations } from "next-intl"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function ProfileLayout({ children }: Props) {
  const t = useTranslations("Profile")
  const messages = useMessages()

  return (
    <>
      <ListTitle>{t("title")}</ListTitle>

      <NextIntlClientProvider messages={pickMessages(messages, "ProfileTabs")}>
        <ProfileTabs />
      </NextIntlClientProvider>

      {children}
    </>
  )
}
