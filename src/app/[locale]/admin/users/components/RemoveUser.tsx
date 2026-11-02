"use client"

import { RemoveButton } from "@/components/RemoveButton"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import { deleteUserById } from "@/lib/users/deleteUserById"

interface Props {
  id: string
  name: string
}

export const RemoveUser = ({ id, name }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const removeUser = async () => {
    const { type, errors } = await deleteUserById(id)

    if (type === "error") {
      errors.forEach(title => toast({ variant: "destructive", title }))
    }
  }

  return (
    <RemoveButton
      className=""
      size="sm"
      label={t("users.remove")}
      description={t("users.removeText", { name })}
      onConfirm={removeUser}
    />
  )
}
