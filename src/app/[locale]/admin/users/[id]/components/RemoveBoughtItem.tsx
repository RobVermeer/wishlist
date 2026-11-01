"use client"

import { RemoveButton } from "@/components/RemoveButton"
import { useToast } from "@/components/ui/use-toast"
import { deleteBoughtWishlistItemById } from "@/lib/wishlistItems/deleteBoughtWishlistItemById"
import { useTranslations } from "next-intl"

interface Props {
  id: string
  title: string
}

export const RemoveBoughtItem = ({ id, title }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const removeItem = async () => {
    const { type, errors } = await deleteBoughtWishlistItemById(id)

    if (type === "error") {
      errors.forEach(title => toast({ variant: "destructive", title }))
    }
  }

  return (
    <RemoveButton
      className="ml-auto"
      size="sm"
      description={t("user.removeItem", { title })}
      onConfirm={removeItem}
    />
  )
}
