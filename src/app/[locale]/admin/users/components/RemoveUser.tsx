"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import { deleteUserById } from "@/lib/users/deleteUserById"

interface Props {
  id: string
}

export const RemoveUser = ({ id }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const removeUser = async (id: string) => {
    const confirm = window.confirm(t("confirm"))

    if (!confirm) return

    const { type, errors } = await deleteUserById(id)

    if (type === "error") {
      errors.forEach(title => toast({ variant: "destructive", title }))
    }
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => removeUser(id)}>
      {t("users.remove")}
    </Button>
  )
}
