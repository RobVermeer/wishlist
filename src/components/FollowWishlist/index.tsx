"use client"

import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { followWishlistByShareToken } from "@/lib/wishlists/followWishlistByShareToken"

interface Props {
  shareToken: string
  text: string
}

export const FollowWishlist = ({ shareToken, text }: Props) => {
  const { toast } = useToast()
  const router = useRouter()

  async function follow() {
    const result = await followWishlistByShareToken(shareToken)

    if (result.type === "error") {
      result.errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    router.push(`/wishlist/${result.wishlistId}`)
  }

  return (
    <form action={follow}>
      <Button type="submit" className="w-full">
        <Eye size="16" className="mr-2" /> {text}
      </Button>
    </form>
  )
}
