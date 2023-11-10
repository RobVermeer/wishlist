"use client"

import { CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { toggleWishlistItemById } from "@/lib/wishlistItems/toggleWishlistItemById"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  item: Awaited<ReturnType<typeof getWishlistById>>["wishlistItem"][0]
}

export const ToggleItem = ({ item }: Props) => {
  const { toast } = useToast()
  const { id, boughtBy } = item

  async function onToggle() {
    const { type, errors } = await toggleWishlistItemById(id)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    toast({
      title: boughtBy
        ? "Je hebt het afstrepen ongedaan gemaakt"
        : "Je hebt deze wens afgestreept",
    })
  }

  return (
    <form action={onToggle} className="absolute right-1">
      <Button type="submit" variant="ghost" size="icon">
        {boughtBy ? (
          <CheckSquare className="text-primary" strokeWidth="2.5" />
        ) : (
          <Square className="text-secondary-foreground" strokeWidth="2.5" />
        )}
      </Button>
    </form>
  )
}
