"use client"

import { RemoveButton } from "@/components/RemoveButton"
import { useToast } from "@/components/ui/use-toast"
import { deleteWishlistItemForAdmin } from "@/lib/wishlistItems/deleteWishlistItemForAdmin"
import { useTranslations } from "next-intl"

interface Props {
  id: string
  title: string
  bought: boolean
}

export const RemoveItem = ({ id, title, bought }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const removeItem = async () => {
    const { type, errors } = await deleteWishlistItemForAdmin(id)

    if (type === "error") {
      errors.forEach(title => toast({ variant: "destructive", title }))
    }
  }

  return (
    <RemoveButton
      className="ml-auto"
      size="sm"
      description={
        bought
          ? t("user.removeBoughtItem", { title })
          : t("user.removeItem", { title })
      }
      onConfirm={removeItem}
    />
  )
}
