"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Group, Lock, Users } from "lucide-react"
import { TabLink } from "@/components/TabLink"
import { useTranslations } from "next-intl"

export const AdminTabs = () => {
  const segment = useSelectedLayoutSegment()
  const t = useTranslations("Admin")

  return (
    <div className="flex gap-2 overflow-x-scroll">
      <TabLink href="/admin" active={segment === null}>
        <Lock size="16" className="mr-2" /> {t("tabs.dashboard")}
      </TabLink>
      <TabLink href="/admin/groups" active={segment === "groups"}>
        <Group size="16" className="mr-2" /> {t("tabs.groups")}
      </TabLink>
      <TabLink href="/admin/users" active={segment === "users"}>
        <Users size="16" className="mr-2" /> {t("tabs.users")}
      </TabLink>
    </div>
  )
}
