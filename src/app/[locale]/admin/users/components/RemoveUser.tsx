"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { deleteUserById } from "@/lib/users/deleteUserById"

interface Props {
  id: string
}

export const RemoveUser = ({ id }: Props) => {
  const t = useTranslations("Admin")

  const removeUser = async (id: string) => {
    const confirm = window.confirm(t("confirm"))

    if (!confirm) return

    await deleteUserById(id)
  }

  return (
    <Button
      className="absolute right-2"
      size="sm"
      variant="destructive"
      onClick={() => removeUser(id)}
    >
      {t("users.remove")}
    </Button>
  )
}
