"use client"

import { RemoveButton } from "@/components/RemoveButton"
import { useToast } from "@/components/ui/use-toast"
import { deleteWishlistForAdmin } from "@/lib/wishlists/deleteWishlistForAdmin"
import { useTranslations } from "next-intl"

interface Props {
  id: string
  name: string
}

export const RemoveWishlist = ({ id, name }: Props) => {
  const t = useTranslations("Admin")
  const { toast } = useToast()

  const removeWishlist = async () => {
    const { type, errors } = await deleteWishlistForAdmin(id)

    if (type === "error") {
      errors.forEach(title => toast({ variant: "destructive", title }))
    }
  }

  return (
    <RemoveButton
      className="ml-auto"
      size="sm"
      label={t("user.removeWishlist")}
      description={t("user.removeWishlistText", { name })}
      onConfirm={removeWishlist}
    />
  )
}
