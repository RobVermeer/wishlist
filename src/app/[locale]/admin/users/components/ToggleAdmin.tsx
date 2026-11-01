"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import { updateAdminById } from "@/lib/users/updateAdminById"
import { useTransition } from "react"

interface Props {
  id: string
  isAdmin: boolean
}

export const ToggleAdmin = ({ id, isAdmin }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  const toggleAdmin = () => {
    startTransition(async () => {
      const { type, errors } = await updateAdminById(id, !isAdmin)

      if (type === "error") {
        errors.forEach(title => toast({ variant: "destructive", title }))
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={toggleAdmin}
    >
      {isAdmin ? t("users.removeAdmin") : t("users.makeAdmin")}
    </Button>
  )
}
