"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { BookUser, User } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TabLink } from "@/components/TabLink"
import { useTranslations } from "next-intl"

export const ProfileTabs = () => {
  const segment = useSelectedLayoutSegment()
  const t = useTranslations()

  return (
    <ScrollArea className="whitespace-nowrap pb-3 -mb-3">
      <div className="flex gap-2">
        <TabLink className="shrink-0" href="/profile" active={segment === null}>
          <User size="16" className="mr-2" /> {t("ProfileTabs.me")}
        </TabLink>
        <TabLink
          className="shrink-0"
          href="/profile/bought"
          active={segment === "bought"}
        >
          <BookUser size="16" className="mr-2" />
          {t("ProfileTabs.boughtPresents")}
        </TabLink>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
