"use client"

import { Session } from "next-auth"
import { Logo } from "@/components/Logo"
import { Menu } from "./Menu"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
  session: Session | null
}

export function Header({ session }: Props) {
  const { groupId } = useParams()
  const [theme, setTheme] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchTheme = async () => {
      if (!groupId) {
        return setTheme(null)
      }

      const response = await fetch(`/api/theme?groupId=${groupId}`)
      const data = await response.json()

      if (!ignore) {
        setTheme(data?.theme || null)
      }
    }

    fetchTheme()

    return () => {
      ignore = true
    }
  }, [groupId])

  return (
    <header
      className="relative p-4 flex h-64 bg-cover bg-center items-start justify-between"
      style={{
        backgroundImage: `url('/theme/${theme || "background"}.jpg')`,
      }}
    >
      <div className="absolute inset-0 -translate-y-1/3 bg-gradient-to-b from-black to-transparent" />
      <Logo className="relative z-10 text-white" />

      {session && <Menu session={session} />}
    </header>
  )
}
