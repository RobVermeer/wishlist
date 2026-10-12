"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { unDeleteGroupById } from "@/lib/groups/unDeleteGroupById"

interface Props {
  id: string
}

export const UnDeleteGroup = ({ id }: Props) => {
  const t = useTranslations("Admin")

  const unDeleteGroup = async (id: string) => {
    const confirm = window.confirm(t("confirm"))

    if (!confirm) return

    await unDeleteGroupById(id)
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => unDeleteGroup(id)}>
      {t("group.restore")}
    </Button>
  )
}
