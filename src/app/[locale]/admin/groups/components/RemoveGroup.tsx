"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { deleteGroupById } from "@/lib/groups/deleteGroupById"

interface Props {
  id: string
}

export const RemoveGroup = ({ id }: Props) => {
  const t = useTranslations("Admin")

  const removeGroup = async (id: string) => {
    const confirm = window.confirm(t("confirm"))

    if (!confirm) return

    await deleteGroupById(id)
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => removeGroup(id)}>
      {t("groups.remove")}
    </Button>
  )
}
