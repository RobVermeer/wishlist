"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookUser, Group, List, User } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useTranslations } from "next-intl"

export const ProfileTabs = () => {
  const segment = useSelectedLayoutSegment()
  const t = useTranslations()

  return (
    <ScrollArea className="whitespace-nowrap pb-3 -mb-3">
      <div className="flex gap-2">
        <Button
          className="shrink-0"
          variant={segment === null ? "default" : "outline"}
          asChild
        >
          <Link href="/profile">
            <User size="16" className="mr-2" /> {t("ProfileTabs.me")}
          </Link>
        </Button>
        <Button
          className="shrink-0"
          variant={segment === "wishlists" ? "default" : "outline"}
          asChild
        >
          <Link href="/profile/wishlists">
            <List size="16" className="mr-2" /> {t("ProfileTabs.wishlists")}
          </Link>
        </Button>
        <Button
          className="shrink-0"
          variant={segment === "groups" ? "default" : "outline"}
          asChild
        >
          <Link href="/profile/groups">
            <Group size="16" className="mr-2" />
            {t("ProfileTabs.groups")}
          </Link>
        </Button>
        <Button
          className="shrink-0"
          variant={segment === "bought" ? "default" : "outline"}
          asChild
        >
          <Link href="/profile/bought">
            <BookUser size="16" className="mr-2" />
            {t("ProfileTabs.boughtPresents")}
          </Link>
        </Button>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
