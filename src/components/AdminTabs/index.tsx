"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Group, Lock, Users } from "lucide-react"

export const AdminTabs = () => {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 overflow-x-scroll">
      <Button variant={pathname === "/admin" ? "default" : "outline"} asChild>
        <Link href="/admin">
          <Lock size="16" className="mr-2" /> Overzicht
        </Link>
      </Button>
      <Button
        variant={pathname.startsWith("/admin/groups") ? "default" : "outline"}
        asChild
      >
        <Link href="/admin/groups">
          <Group size="16" className="mr-2" /> Groepen
        </Link>
      </Button>
      <Button
        variant={pathname === "/admin/users" ? "default" : "outline"}
        asChild
      >
        <Link href="/admin/users">
          <Users size="16" className="mr-2" /> Gebruikers
        </Link>
      </Button>
    </div>
  )
}
