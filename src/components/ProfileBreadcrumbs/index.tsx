"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { useTranslations } from "next-intl"
import { Breadcrumbs } from "@/components/Breadcrumbs"

export const ProfileBreadcrumbs = () => {
  const segment = useSelectedLayoutSegment()
  const t = useTranslations("ProfileTabs")

  if (segment === "bought") {
    return (
      <Breadcrumbs
        parents={[{ label: t("me"), href: "/profile" }]}
        current={t("boughtPresents")}
      />
    )
  }

  return <Breadcrumbs current={t("me")} />
}
