"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const ProfileTabs = () => {
  const pathname = usePathname()

  return (
    <div className="flex gap-2">
      <Button variant={pathname === "/profile" ? "default" : "ghost"} asChild>
        <Link href="/profile">Verlanglijstjes</Link>
      </Button>
      <Button
        variant={pathname === "/profile/groups" ? "default" : "ghost"}
        asChild
      >
        <Link href="/profile/groups">Groepen</Link>
      </Button>
      <Button
        variant={pathname === "/profile/bought" ? "default" : "ghost"}
        asChild
      >
        <Link href="/profile/bought">Gekochte cadeaus</Link>
      </Button>
    </div>
  )
}
