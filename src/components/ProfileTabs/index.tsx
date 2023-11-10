"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookUser, Group, List } from "lucide-react"

export const ProfileTabs = () => {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 overflow-x-scroll">
      <Button variant={pathname === "/profile" ? "default" : "outline"} asChild>
        <Link href="/profile">
          <List size="16" className="mr-2" /> Verlanglijstjes
        </Link>
      </Button>
      <Button
        variant={pathname === "/profile/groups" ? "default" : "outline"}
        asChild
      >
        <Link href="/profile/groups">
          <Group size="16" className="mr-2" />
          Groepen
        </Link>
      </Button>
      <Button
        variant={pathname === "/profile/bought" ? "default" : "outline"}
        asChild
      >
        <Link href="/profile/bought">
          <BookUser size="16" className="mr-2" />
          Gekochte cadeaus
        </Link>
      </Button>
    </div>
  )
}
