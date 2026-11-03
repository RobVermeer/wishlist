import { AdminTabs } from "@/components/AdminTabs"
import { ListTitle } from "@/components/ListTitle"
import { ReactNode } from "react"
import { getSession } from "@/lib/getSession"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

interface Props {
  children: ReactNode
}

export default async function ProfileLayout({ children }: Props) {
  const session = await getSession()

  if (!session?.user.isAdmin) {
    redirect("/")
  }

  const t = await getTranslations("Admin")

  return (
    <>
      <ListTitle>{t("title")}</ListTitle>

      <AdminTabs />

      {children}
    </>
  )
}
