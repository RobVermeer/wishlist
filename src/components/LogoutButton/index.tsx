"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export const LogoutButton = () => {
  const t = useTranslations("Profile")

  return (
    <Button variant="outline" onClick={() => signOut()}>
      <LogOut size="16" className="mr-2" /> {t("logout")}
    </Button>
  )
}
