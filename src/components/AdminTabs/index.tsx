"use client"

import { useSelectedLayoutSegment } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Group, Lock, Users } from "lucide-react"

export const AdminTabs = () => {
  const segment = useSelectedLayoutSegment()

  return (
    <div className="flex gap-2 overflow-x-scroll">
      <Button variant={segment === null ? "default" : "outline"} asChild>
        <Link href="/admin">
          <Lock size="16" className="mr-2" /> Overzicht
        </Link>
      </Button>
      <Button variant={segment === "groups" ? "default" : "outline"} asChild>
        <Link href="/admin/groups">
          <Group size="16" className="mr-2" /> Groepen
        </Link>
      </Button>
      <Button variant={segment === "users" ? "default" : "outline"} asChild>
        <Link href="/admin/users">
          <Users size="16" className="mr-2" /> Gebruikers
        </Link>
      </Button>
    </div>
  )
}
