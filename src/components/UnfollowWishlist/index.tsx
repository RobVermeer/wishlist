"use client"

import { EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { unfollowWishlistById } from "@/lib/wishlists/unfollowWishlistById"

interface Props {
  wishlistId: string
}

export const UnfollowWishlist = ({ wishlistId }: Props) => {
  const t = useTranslations("UnfollowWishlist")
  const { toast } = useToast()
  const router = useRouter()

  async function unfollow() {
    const result = await unfollowWishlistById(wishlistId)

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
    <form action={unfollow}>
      <Button type="submit" variant="outline" className="w-full">
        <EyeOff size="16" className="mr-2" /> {t("button")}
      </Button>
    </form>
  )
}
