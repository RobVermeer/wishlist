"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const AdminTabs = () => {
  const pathname = usePathname()

  return (
    <div className="flex gap-2">
      <Button variant={pathname === "/admin" ? "default" : "ghost"} asChild>
        <Link href="/admin">Overzicht</Link>
      </Button>
      <Button
        variant={pathname === "/admin/groups" ? "default" : "ghost"}
        asChild
      >
        <Link href="/admin/groups">Groepen</Link>
      </Button>
      <Button
        variant={pathname === "/admin/users" ? "default" : "ghost"}
        asChild
      >
        <Link href="/admin/users">Gebruikers</Link>
      </Button>
    </div>
  )
}
