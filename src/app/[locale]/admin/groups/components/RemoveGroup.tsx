"use client"

import { RemoveButton } from "@/components/RemoveButton"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import { deleteGroupById } from "@/lib/groups/deleteGroupById"

interface Props {
  id: string
  title: string
}

export const RemoveGroup = ({ id, title }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const removeGroup = async () => {
    const { type, errors } = await deleteGroupById(id)

    if (type === "error") {
      errors.forEach(title => toast({ variant: "destructive", title }))
    }
  }

  return (
    <RemoveButton
      className=""
      size="sm"
      label={t("groups.remove")}
      description={t("groups.removeText", { title })}
      onConfirm={removeGroup}
    />
  )
}
