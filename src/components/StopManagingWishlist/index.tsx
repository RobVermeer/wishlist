"use client"

import { UserMinus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { stopManagingWishlistById } from "@/lib/wishlists/stopManagingWishlistById"

interface Props {
  wishlistId: string
}

export const StopManagingWishlist = ({ wishlistId }: Props) => {
  const t = useTranslations("StopManagingWishlist")
  const { toast } = useToast()
  const router = useRouter()

  async function stopManaging() {
    const result = await stopManagingWishlistById(wishlistId)

    if (result.type === "error") {
      result.errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    toast({ title: t("toast") })
    router.push("/")
  }

  return (
    <form action={stopManaging}>
      <Button type="submit" variant="outline" className="w-full">
        <UserMinus size="16" className="mr-2" /> {t("button")}
      </Button>
    </form>
  )
}
